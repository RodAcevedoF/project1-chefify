import { UserRepository } from '../repositories';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../errors';
import type { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { bcryptWrapper } from '../utils';
import type { IUser, UserInput } from '../schemas';
import { sendEmail } from './email.service';
import { redisClient } from '../config/redis.config';
import logger from '../utils/logger';
import { emailRoute } from '@/utils/emailRoutes';

type RedisCompat = {
	sAdd?: (key: string, member: string) => Promise<number>;
	sRem?: (key: string, member: string) => Promise<number>;
	sMembers?: (key: string) => Promise<string[]>;
	del?: (...keys: string[]) => Promise<number>;
};
const redis = redisClient as unknown as RedisCompat;

export const AuthService = {
	async register(data: UserInput): Promise<void> {
		const existing = await UserRepository.findByEmail(data.email);
		if (existing) throw new BadRequestError('Email already exists');
		const verificationToken = uuidv4();
		await UserRepository.createUser({
			...data,
			emailVerificationToken: verificationToken,
			emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 4),
		});

		const user = await UserRepository.findByEmail(data.email);
		if (!user) throw new BadRequestError('user not found');
		const verifyLink = emailRoute(verificationToken, { option: 'verify' });

		await sendEmail({
			to: user.email,
			type: 'VERIFICATION',
			payload: { link: verifyLink },
		});
	},

	async verifyEmail(token: string): Promise<void> {
		const user = await UserRepository.findByEmailToken(token);
		if (user) {
			await UserRepository.updateById(user._id, {
				isVerified: true,
				emailVerificationToken: undefined,
				emailVerificationExpires: undefined,
			});
			return;
		}

		const expiredUser =
			await UserRepository.findByEmailTokenIgnoreExpiry(token);
		if (expiredUser && !expiredUser.isVerified) {
			const newToken = uuidv4();
			await UserRepository.updateById(expiredUser._id, {
				emailVerificationToken: newToken,
				emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 4),
			});
			const verifyLink = emailRoute(newToken, { option: 'verify' });
			await sendEmail({
				to: expiredUser.email,
				type: 'VERIFICATION',
				payload: { link: verifyLink },
			});

			throw new BadRequestError(
				'Verification token expired. A new link has been sent to your email.',
			);
		}

		throw new NotFoundError('User not found');
	},

	async login(
		email: string,
		password: string,
	): Promise<{ id: string; email: string; role: string }> {
		const user = await UserRepository.findByEmail(email);
		if (!user) throw new NotFoundError('Email provided not found');
		if (!user.isVerified) {
			throw new UnauthorizedError('Email not verified');
		}
		const isValid = await bcryptWrapper.compare(password, user.password);
		if (!isValid) throw new UnauthorizedError('Invalid credentials');

		const result = { id: String(user._id), email: user.email, role: user.role };
		return result;
	},

	async forgotPassword(email: string): Promise<void> {
		const user = await UserRepository.findByEmail(email);
		if (!user) throw new NotFoundError('User not found');

		const token = uuidv4();
		const data = {
			resetPasswordToken: token,
			resetPasswordExpires: new Date(Date.now() + 3600000),
		};
		await UserRepository.updateById(user._id, data);

		const resetLink = emailRoute(token, { option: 'reset' });

		await sendEmail({
			to: user.email,
			type: 'RESET_PASSWORD',
			payload: { link: resetLink },
		});
	},

	async resetPassword(token: string, newPassword: string): Promise<void> {
		const user = await UserRepository.findByResetToken(token);
		if (!user) throw new BadRequestError('Invalid or expired token');

		//export doc from schema
		const userDoc = user as HydratedDocument<IUser>;
		userDoc.password = newPassword;
		userDoc.resetPasswordToken = undefined;
		userDoc.resetPasswordExpires = undefined;
		await userDoc.save();

		try {
			await UserRepository.addOperation(user._id, {
				type: 'password_reset',
				resource: 'user',
				resourceId: user._id,
				summary: 'Password reset via email token',
			});
		} catch (err) {
			logger.warn('Could not record password reset operation', err);
		}

		//FIXME
		try {
			const target = user._id;
			const members = (await redis.sMembers?.(`user:sessions:${target}`)) ?? [];
			if (Array.isArray(members) && members.length > 0) {
				const keys = members.map((sid) => `sess:${sid}`);
				if (keys.length > 0 && redis.del) await redis.del(...keys);
				if (redis.del) await redis.del(`user:sessions:${target}`);
			}
		} catch (err) {
			logger.warn(
				'Could not remove sessions for user after password reset',
				err,
			);
		}
	},

	async validateResetToken(token: string): Promise<boolean> {
		const user = await UserRepository.findByResetToken(token);
		return Boolean(user);
	},

	async status(
		userId: string,
	): Promise<Pick<IUser, 'isVerified' | 'role' | 'aiUsage'> & { id: string }> {
		const user = await UserRepository.findById(userId);
		if (!user) throw new NotFoundError('User not found');
		return {
			isVerified: user.isVerified,
			id: user._id,
			role: user.role,
			aiUsage: user.aiUsage,
		};
	},

	async changePassword(
		userId: string,
		currentPassword: string | null,
		newPassword: string,
		options?: {
			asAdmin?: boolean;
			targetUserId?: string;
			excludeSessionId?: string;
		},
	): Promise<void> {
		const targetId =
			options?.asAdmin && options?.targetUserId ? options.targetUserId : userId;

		const user = await UserRepository.findById(targetId);
		if (!user) throw new NotFoundError('User not found');

		if (!options?.asAdmin) {
			if (!currentPassword)
				throw new BadRequestError('Current password is required');
			const isValid = await bcryptWrapper.compare(
				currentPassword,
				user.password,
			);
			if (!isValid)
				throw new UnauthorizedError('Current password is incorrect');
		}

		const userDoc = user as HydratedDocument<IUser>;
		userDoc.password = newPassword;
		await userDoc.save();

		try {
			await UserRepository.addOperation(user._id, {
				type: 'password_change',
				resource: 'user',
				resourceId: user._id,
				summary:
					options?.asAdmin ?
						'Password changed by admin'
					:	'Password changed by user',
			});
		} catch (err) {
			logger.warn('Could not record password change operation', err);
		}

		try {
			const target =
				options?.asAdmin && options?.targetUserId ?
					options!.targetUserId!
				:	user._id;
			const members = (await redis.sMembers?.(`user:sessions:${target}`)) ?? [];
			if (Array.isArray(members) && members.length > 0) {
				const exclude = options?.excludeSessionId;
				const membersToRemove =
					exclude ? members.filter((m) => m !== exclude) : members;
				const keys = membersToRemove.map((sid) => `sess:${sid}`);
				if (keys.length > 0 && redis.del) await redis.del(...keys);

				if (membersToRemove.length === members.length) {
					if (redis.del) await redis.del(`user:sessions:${target}`);
				} else if (membersToRemove.length > 0 && redis.sRem) {
					await Promise.all(
						membersToRemove.map(
							(m) =>
								redis.sRem?.(`user:sessions:${target}`, m) as Promise<number>,
						),
					);
				}
			}
		} catch (err) {
			logger.warn(
				'Could not remove sessions for user after password change',
				err,
			);
		}
	},
};
