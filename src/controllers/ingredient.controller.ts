import type { Request, Response, NextFunction } from 'express';
import { IngredientService } from '../services';
import { successResponse } from '../utils';
import type { IngredientInput } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';

export const IngredientController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body as IngredientInput;
			const newIngredient: IngredientInput = {
				name: body.name,
				unit: body.unit,
				userId: req.user?.id,
			};
			await IngredientService.createIngredient(newIngredient);
			return successResponse(res, 'Ingredient successfully created', 201);
		} catch (error) {
			console.error(error);
			next(error);
		}
	},

	async get(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const { category, userId, name, sort, limit, page } = req.query;

			const query: Record<string, unknown> = {};
			if (category) query.categories = category;
			if (userId) query.userId = userId;
			if (name) query.name = { $regex: name, $options: 'i' };

			if (!id) throw new BadRequestError('Invalid ID format');
			const ingredient = await IngredientService.getIngredients({
				id,
				query,
				sort: sort === 'asc' ? 1 : -1,
				limit: limit ? Number(limit) : 10,
				skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : 0,
			});
			if (!ingredient) throw new NotFoundError('Ingredient not found');
			return successResponse(res, ingredient);
		} catch (error) {
			next(error);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			if (!id) throw new BadRequestError('Invalid ID');
			await IngredientService.updateIngredient(id, req.body);
			return successResponse(res, 'Ingredient successfully updated');
		} catch (error) {
			next(error);
		}
	},

	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			if (!id) throw new BadRequestError('Invalid ID');
			await IngredientService.deleteIngredient(id);
			return successResponse(res, 'Ingredient deleted', 204);
		} catch (error) {
			next(error);
		}
	},
};
