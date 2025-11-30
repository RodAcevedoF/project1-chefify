import type { Request, Response } from 'express';
import { AuthService } from '../services';
import { successResponse } from '../utils';
import { BadRequestError, ValidationError } from '../errors';
import { COOKIE_OPTIONS, COOKIE_NAME } from '../utils';
import type { UserInput } from '../schemas';
import type { Session, SessionData } from 'express-session';

export const AuthController = {
	async register(req: Request, res: Response) {
		const data = req.body as UserInput;
		const created = await AuthService.register(data);
		return successResponse(res, created, 201);
	},

	async verifyEmail(req: Request, res: Response) {
		const { token } = req.query;
		if (!token) throw new BadRequestError('Invalid token');
		await AuthService.verifyEmail(token.toString());
		const frontend = process.env.FRONTEND_URL;
		return res.redirect(`${frontend}/?verified=true`);
	},

	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new BadRequestError('Email and password are required');
		}

		const {
			id: userId,
			email: userEmail,
			role,
		} = await AuthService.login(email, password);

		if (!req.session) {
			req.session = {} as unknown as Session &
				SessionData & {
					user?: { id: string; email: string; role: string };
				};
		}

		const sessionObj = req.session as unknown as Session &
			SessionData & {
				user?: { id: string; email: string; role: string };
			};
		sessionObj.user = { id: String(userId), email: userEmail, role };

		const sid = req.sessionID ?? req.session?.id;
		if (sid && userId) await AuthService.addSession(userId, sid);

		return successResponse(res, { message: 'Login successful' });
	},

	async logout(req: Request, res: Response) {
		if (req.session) {
			const sid = req.sessionID ?? req.session?.id;
			req.session.destroy?.(() => {
				if (sid && req.user?.id) {
					AuthService.removeSession(req.user.id, sid).catch(() => null);
				}
			});
		}

		const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'sid';
		res.clearCookie(sessionCookieName);
		if (COOKIE_NAME) res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

		return successResponse(res, { message: 'Logged out successfully' });
	},

	async logoutAll(req: Request, res: Response) {
		const userId = req.params.id || req.user?.id;
		if (!userId) {
			throw new ValidationError('User ID not found in request');
		}
		await AuthService.clearAllSessions(userId);

		const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'sid';
		res.clearCookie(sessionCookieName);
		if (COOKIE_NAME) res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

		return successResponse(res, { message: 'Logged out from all devices' });
	},

	async forgotPassword(req: Request, res: Response) {
		const { email } = req.body;
		if (!email) {
			throw new BadRequestError('Email is required');
		}

		await AuthService.forgotPassword(email);
		return successResponse(res, { message: 'Password reset link sent' });
	},

	async resetPasswordPage(req: Request, res: Response) {
		const { token } = req.query;
		if (!token) throw new BadRequestError('Invalid token');

		const isValid = await AuthService.validateResetToken(token.toString());

		const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
		const resetPath = '/reset-password';

		if (!isValid) {
			return res.redirect(`${frontend}${resetPath}?invalid=true`);
		}
		return res.redirect(
			`${frontend}${resetPath}?token=${encodeURIComponent(token.toString())}`,
		);
	},
	async resetPassword(req: Request, res: Response) {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			throw new BadRequestError('Token and new password are required');
		}

		await AuthService.resetPassword(token, newPassword);

		return successResponse(res, { message: 'Password updated successfully' });
	},

	async changePassword(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestError('User not authenticated');

		const { currentPassword, newPassword, targetUserId } = req.body as {
			currentPassword?: string;
			newPassword?: string;
			targetUserId?: string;
		};

		if (!newPassword) throw new BadRequestError('New password is required');

		const asAdmin = req.user?.role === 'admin' && Boolean(targetUserId);

		await AuthService.changePassword(
			userId,
			currentPassword ?? null,
			newPassword,
			{
				asAdmin,
				targetUserId,
				excludeSessionId: req.sessionID ?? req.session?.id,
			},
		);
		return successResponse(res, { message: 'Password updated successfully' });
	},

	async status(req: Request, res: Response) {
		const userId = req?.user?.id;
		if (!userId) throw new BadRequestError('User ID not found');
		const data = await AuthService.status(userId);
		successResponse(res, data);
	},
};
