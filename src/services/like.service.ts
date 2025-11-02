import { LikeRepository } from '../repositories/like.repository';
import type { LikeInput } from '../schemas/like.schema';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { RecipeRepository } from '../repositories/recipe.repository';
import { NotFoundError } from '../errors';
import logger from '../utils/logger';
import { RecipeRepository as RR } from '../repositories/recipe.repository';
import type { Operation } from '../schemas';

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

			try {
				const op: Operation = {
					type: 'like',
					resource: 'recipe',
					resourceId: recipeId,
					summary: `Liked recipe ${recipe.title}`,
					meta: {},
					createdAt: new Date(),
				};
				await UserService.recordOperation(userId, op);
			} catch (err) {
				logger.warn('Failed to record like operation', err);
			}
		} catch (err: unknown) {
			const e = err as { code?: number; codeName?: string } | undefined;
			if (e && (e.code === 11000 || e.codeName === 'DuplicateKey')) return;
			throw err;
		}
	},

	async unlike(userId: string, recipeId: string): Promise<void> {
		const deleted = await LikeRepository.delete(userId, recipeId);
		if (process.env.NODE_ENV === 'development') {
			logger.debug(
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

			try {
				const op: Operation = {
					type: 'unlike',
					resource: 'recipe',
					resourceId: recipeId,
					summary: `Removed like from recipe ${recipeId}`,
					meta: {},
					createdAt: new Date(),
				};
				await UserService.recordOperation(userId, op);
			} catch (err) {
				logger.warn('Failed to record unlike operation', err);
			}
		}
	},

	async hasLiked(userId: string, recipeId: string): Promise<boolean> {
		return await LikeRepository.exists(userId, recipeId);
	},

	async countLikes(recipeId: string): Promise<number> {
		return await LikeRepository.countForRecipe(recipeId);
	},
};
