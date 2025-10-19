import { Like } from '../models/like.model';
import type { LikeInput } from '../schemas/like.schema';

export const LikeRepository = {
	async create(data: LikeInput): Promise<void> {
		await Like.create(data);
	},

	async delete(userId: string, recipeId: string) {
		const doc = await Like.findOneAndDelete({ userId, recipeId }).lean();
		return doc !== null;
	},

	async exists(userId: string, recipeId: string): Promise<boolean> {
		const found = await Like.findOne({ userId, recipeId }).lean();
		return !!found;
	},

	async countForRecipe(recipeId: string): Promise<number> {
		return await Like.countDocuments({ recipeId });
	},

	async getLikesForRecipe(recipeId: string, skip = 0, limit = 20) {
		return await Like.find({ recipeId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();
	},
};
