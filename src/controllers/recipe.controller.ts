import type { Request, Response } from 'express';
import type { ExtendedRequest } from '../types';
import { RecipeService } from '../services';
import { successResponse } from '../utils';
import { RecipeInputSchema, type RecipeInput, type IRecipe } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';
import { extractPayload, extractFileBuffer } from '../utils/requestBody';

export const RecipeController = {
	async create(req: ExtendedRequest, res: Response) {
		if (!req.user?.id) {
			throw new BadRequestError('User ID missing in request');
		}
		const body = RecipeInputSchema.parse(extractPayload(req.body));

		const newRecipe: RecipeInput = {
			...body,
			userId: req.user.id,
		};

		const fileBuffer = extractFileBuffer(req);

		await RecipeService.createRecipe(newRecipe, req.user.id, fileBuffer);
		return successResponse(res, 'Recipe successfully created', 201);
	},

	async update(req: ExtendedRequest, res: Response) {
		const { id } = req.params;
		if (!id) throw new BadRequestError('Invalid ID');
		const updateData = extractPayload(req.body) as Partial<IRecipe>;
		const userId = req.user!.id;
		const fileBuffer = extractFileBuffer(req);
		await RecipeService.updateRecipe(id, updateData, userId, fileBuffer);
		return successResponse(res, 'Successfully updated', 204);
	},

	async delete(req: Request, res: Response) {
		const { id } = req.params;
		if (!id) throw new BadRequestError('Invalid ID');
		const userId = req.user!.id;
		await RecipeService.deleteRecipe(id, userId);
		return successResponse(res, 'Recipe deleted', 204);
	},

	async getSuggestedRecipe(req: Request, res: Response) {
		const suggestion = await RecipeService.generateSuggestedRecipe();
		if (!suggestion) {
			throw new BadRequestError('Invalid recipe suggestion from AI');
		}
		return successResponse(res, { recipe: suggestion });
	},

	async get(req: Request, res: Response) {
		const { id } = req.params;
		const { category, userId, title, sort, limit, page } = req.query;

		if (id) {
			const recipe = await RecipeService.getRecipes({ id });
			if (!recipe) throw new NotFoundError('Recipe not found');
			return successResponse(res, recipe);
		}

		const query: Record<string, unknown> = {};
		if (category) query.categories = category;
		if (userId) query.userId = userId;
		if (title) query.title = { $regex: title, $options: 'i' };

		const recipes = await RecipeService.getRecipes({
			query,
			sort: sort === 'asc' ? 1 : -1,
			limit: limit ? Number(limit) : 10,
			skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : 0,
		});
		if (!recipes) throw new NotFoundError('Ingredient not found');
		return successResponse(res, recipes);
	},
};
