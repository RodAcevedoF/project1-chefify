import type { Request, Response } from 'express';
import { FollowService } from '../services';
import { successResponse } from '../utils';
import { BadRequestError } from '../errors';

export const FollowController = {
	async follow(req: Request, res: Response) {
		const followerId = req.user?.id;
		const { userId: followingId } = req.params;
		if (!followerId || !followingId) throw new BadRequestError('Missing ids');
		await FollowService.follow(followerId, followingId);
		const followersCount = await FollowService.countFollowers(followingId);
		const isFollowing = await FollowService.hasFollowing(
			followerId,
			followingId,
		);
		return successResponse(res, { followersCount, isFollowing });
	},

	async unfollow(req: Request, res: Response) {
		const followerId = req.user?.id;
		const { userId: followingId } = req.params;
		if (!followerId || !followingId) throw new BadRequestError('Missing ids');
		await FollowService.unfollow(followerId, followingId);
		const followersCount = await FollowService.countFollowers(followingId);
		const isFollowing = await FollowService.hasFollowing(
			followerId,
			followingId,
		);
		return successResponse(res, { followersCount, isFollowing });
	},

	async getFollowers(req: Request, res: Response) {
		const { userId } = req.params;
		if (!userId) throw new BadRequestError('userId required');
		const query = req.query as unknown as { skip?: string; limit?: string };
		const skip = query.skip ?? '0';
		const limit = query.limit ?? '20';
		const data = await FollowService.getFollowers(
			userId,
			Number(skip),
			Number(limit),
		);
		return successResponse(res, data);
	},

	async getFollowing(req: Request, res: Response) {
		const { userId } = req.params;
		if (!userId) throw new BadRequestError('userId required');
		const query = req.query as unknown as { skip?: string; limit?: string };
		const skip = query.skip ?? '0';
		const limit = query.limit ?? '20';
		const data = await FollowService.getFollowing(
			userId,
			Number(skip),
			Number(limit),
		);
		return successResponse(res, data);
	},

	async isFollowing(req: Request, res: Response) {
		const followerId = req.user?.id;
		const { userId: followingId } = req.params;
		if (!followerId || !followingId) throw new BadRequestError('Missing ids');
		const isFollowing = await FollowService.hasFollowing(
			followerId,
			followingId,
		);
		return successResponse(res, { isFollowing });
	},
};
