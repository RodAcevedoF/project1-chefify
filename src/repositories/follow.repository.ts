import { Follow } from '../models/follow.model';
import type { FollowInput } from '../schemas/follow.schema';

export const FollowRepository = {
	async create(data: FollowInput): Promise<void> {
		await Follow.create(data);
	},

	async delete(follower: string, following: string) {
		const result = await Follow.deleteOne({ follower, following });
		return (result.deletedCount ?? 0) > 0;
	},

	async exists(follower: string, following: string): Promise<boolean> {
		const found = await Follow.findOne({ follower, following }).lean();
		return !!found;
	},

	async countFollowers(userId: string): Promise<number> {
		return await Follow.countDocuments({ following: userId });
	},

	async countFollowing(userId: string): Promise<number> {
		return await Follow.countDocuments({ follower: userId });
	},

	async getFollowers(userId: string, skip = 0, limit = 20) {
		return await Follow.find({ following: userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();
	},

	async getFollowing(userId: string, skip = 0, limit = 20) {
		return await Follow.find({ follower: userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();
	},
};
