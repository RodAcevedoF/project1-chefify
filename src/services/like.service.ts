import { LikeRepository } from '../repositories/like.repository';
import type { LikeInput } from '../schemas/like.schema';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { RecipeRepository } from '../repositories/recipe.repository';
import { NotFoundError } from '../errors';
import { RecipeRepository as RR } from '../repositories/recipe.repository';

export const LikeService = {
	async like(userId: string, recipeId: string): Promise<void> {
		const user = await UserService.getUserById(userId);
		if (!user) throw new NotFoundError('User not found');
		const recipe = await RecipeRepository.findById(recipeId);
		if (!recipe) throw new NotFoundError('Recipe not found');

		const payload: LikeInput = { userId, recipeId };
		try {
			await LikeRepository.create(payload);
			await RR.incLikesCount(recipeId, 1);
			await UserRepository.addSavedRecipe(userId, recipeId);
		} catch (err: unknown) {
			const e = err as { code?: number; codeName?: string } | undefined;
			if (e && (e.code === 11000 || e.codeName === 'DuplicateKey')) return;
			throw err;
		}
	},

	async unlike(userId: string, recipeId: string): Promise<void> {
		const deleted = await LikeRepository.delete(userId, recipeId);
		if (process.env.NODE_ENV === 'development') {
			console.debug(
				'[LikeService.unlike] deleted:',
				deleted,
				'userId:',
				userId,
				'recipeId:',
				recipeId,
			);
		}
		if (deleted) {
			await RR.incLikesCount(recipeId, -1);
			await UserRepository.removeSavedRecipe(userId, recipeId);
		}
	},

	async hasLiked(userId: string, recipeId: string): Promise<boolean> {
		return await LikeRepository.exists(userId, recipeId);
	},

	async countLikes(recipeId: string): Promise<number> {
		return await LikeRepository.countForRecipe(recipeId);
	},

	async getLikesForRecipe(recipeId: string, skip = 0, limit = 20) {
		return await LikeRepository.getLikesForRecipe(recipeId, skip, limit);
	},
};
