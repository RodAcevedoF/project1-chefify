import { FollowRepository } from '../repositories/follow.repository';
import { BadRequestError, NotFoundError } from '../errors';
import type { FollowInput } from '../schemas/follow.schema';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import type { Operation } from '../schemas';
import logger from '../utils/logger';

export const FollowService = {
	async follow(followerId: string, followingId: string): Promise<void> {
		if (followerId === followingId) {
			throw new BadRequestError('Cannot follow yourself');
		}

		const follower = await UserService.getUserById(followerId);
		if (!follower) throw new NotFoundError('Follower not found');
		const following = await UserService.getUserById(followingId);
		if (!following) throw new NotFoundError('User to follow not found');

		const payload: FollowInput = {
			follower: followerId,
			following: followingId,
		};
		try {
			await FollowRepository.create(payload);
			await UserRepository.incFollowersCount(followingId, 1);
			await UserRepository.incFollowingCount(followerId, 1);

			try {
				const op: Operation = {
					type: 'follow',
					resource: 'user',
					resourceId: followingId,
					summary: `Followed ${following.name}`,
					meta: {},
					createdAt: new Date(),
				};
				await UserService.recordOperation(followerId, op);
			} catch (err) {
				logger.warn('Failed to record follow operation', err);
			}
		} catch (err: unknown) {
			const e = err as { code?: number; codeName?: string } | undefined;
			if (e && (e.code === 11000 || e.codeName === 'DuplicateKey')) return;
			throw err;
		}
	},

	async unfollow(followerId: string, followingId: string): Promise<void> {
		const deleted = await FollowRepository.delete(followerId, followingId);
		if (deleted) {
			await UserRepository.incFollowersCount(followingId, -1);
			await UserRepository.incFollowingCount(followerId, -1);

			try {
				const op: Operation = {
					type: 'unfollow',
					resource: 'user',
					resourceId: followingId,
					summary: `Unfollowed user ${followingId}`,
					meta: {},
					createdAt: new Date(),
				};
				await UserService.recordOperation(followerId, op);
			} catch (err) {
				logger.warn('Failed to record unfollow operation', err);
			}
		}
	},
	async countFollowers(userId: string): Promise<number> {
		return await FollowRepository.countFollowers(userId);
	},

	async countFollowing(userId: string): Promise<number> {
		return await FollowRepository.countFollowing(userId);
	},

	async getFollowers(userId: string, skip = 0, limit = 20) {
		return await FollowRepository.getFollowers(userId, skip, limit);
	},

	async getFollowing(userId: string, skip = 0, limit = 20) {
		return await FollowRepository.getFollowing(userId, skip, limit);
	},

	async hasFollowing(
		followerId: string,
		followingId: string,
	): Promise<boolean> {
		return await FollowRepository.exists(followerId, followingId);
	},
};
