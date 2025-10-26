import type { Request, Response } from 'express';
import { LikeService } from '../services';
import { successResponse } from '../utils';
import { BadRequestError } from '../errors';

export const LikeController = {
	async like(req: Request, res: Response) {
		const userId = req.user?.id;
		const { recipeId } = req.params;
		if (!userId || !recipeId) throw new BadRequestError('Missing ids');
		await LikeService.like(userId, recipeId);
		const likesCount = await LikeService.countLikes(recipeId);
		const hasLiked = await LikeService.hasLiked(userId, recipeId);
		return successResponse(res, { likesCount, hasLiked });
	},

	async unlike(req: Request, res: Response) {
		const userId = req.user?.id;
		const { recipeId } = req.params;
		if (!userId || !recipeId) throw new BadRequestError('Missing ids');
		await LikeService.unlike(userId, recipeId);
		const likesCount = await LikeService.countLikes(recipeId);
		const hasLiked = await LikeService.hasLiked(userId, recipeId);
		return successResponse(res, { likesCount, hasLiked });
	},

	async hasLiked(req: Request, res: Response) {
		const userId = req.user?.id;
		const { recipeId } = req.params;
		if (!userId || !recipeId) throw new BadRequestError('Missing ids');
		const data = await LikeService.hasLiked(userId, recipeId);
		return successResponse(res, data);
	},
};
