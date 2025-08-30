import type { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services';
import { successResponse } from '../utils';
import { RecipeInputSchema, type RecipeInput } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';

type RecipeBody = Omit<RecipeInput, 'userId'>;

export const RecipeController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user?.id) {
				throw new BadRequestError('User ID missing in request');
			}

			const body: RecipeBody = RecipeInputSchema.parse(req.body);

			const newRecipe: RecipeInput = {
				...body,
				userId: req.user.id,
			};

			await RecipeService.createRecipe(newRecipe);
			return successResponse(res, 'Recipe successfully created', 201);
		} catch (error) {
			next(error);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			if (!id) throw new BadRequestError('Invalid ID');
			const updateData = req.body;
			await RecipeService.updateRecipe(id, updateData);
			return successResponse(res, 'Successfully updated', 204);
		} catch (error) {
			next(error);
		}
	},

	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			if (!id) throw new BadRequestError('Invalid ID');
			await RecipeService.deleteRecipe(id);
			return successResponse(res, 'Recipe deleted', 204);
		} catch (error) {
			next(error);
		}
	},

	async getSuggestedRecipe(req: Request, res: Response, next: NextFunction) {
		try {
			const suggestion = await RecipeService.generateSuggestedRecipe();
			if (!suggestion) {
				throw new BadRequestError('Invalid recipe suggestion from AI');
			}
			return successResponse(res, { recipe: suggestion });
		} catch (err) {
			next(err);
		}
	},

	async get(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const { category, userId, title, sort, limit, page } = req.query;

			const query: Record<string, unknown> = {};
			if (category) query.categories = category;
			if (userId) query.userId = userId;
			if (title) query.title = { $regex: title, $options: 'i' };

			const recipes = await RecipeService.getRecipes({
				id,
				query,
				sort: sort === 'asc' ? 1 : -1,
				limit: limit ? Number(limit) : 10,
				skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : 0,
			});
			if (!recipes) throw new NotFoundError('Ingredient not found');
			return successResponse(res, recipes);
		} catch (error) {
			next(error);
		}
	},
};
