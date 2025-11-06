import type { Request, Response } from 'express';
import { ForbiddenError, BadRequestError, NotFoundError } from '../errors';
import { successResponse, readRecipeCsv, readIngredient } from '../utils';
import { IngredientService, RecipeService, UserService } from '../services';

export const AdminController = {
	async importRecipes(req: Request, res: Response) {
		if (req.user?.role !== 'admin') {
			throw new ForbiddenError('Only admins can import recipes');
		}

		const file = req.file;
		if (!file) throw new BadRequestError('No file uploaded');

		const records = await readRecipeCsv(file);
		if (!records.length) {
			throw new BadRequestError('No valid recipes found in file');
		}

		const inserted = await RecipeService.importRecipesFromCsv(records);

		return successResponse(
			res,
			{
				message: `Imported ${inserted.length} recipes successfully`,
				data: inserted,
			},
			201,
		);
	},
	async importIngredients(req: Request, res: Response) {
		if (req.user?.role !== 'admin') {
			throw new ForbiddenError('Only admins can import recipes');
		}

		const file = req.file;
		if (!file) throw new BadRequestError('No file uploaded');

		const records = await readIngredient(file);
		if (!records.length) {
			throw new BadRequestError('No valid recipes found in file');
		}

		const inserted = await IngredientService.importIngredientsFromCsv(records);

		return successResponse(
			res,
			{
				message: `Imported ${inserted.length} ingredients}`,
				data: inserted,
			},
			201,
		);
	},
	async getUsers(req: Request, res: Response) {
		// ?page=1&limit=20&sort=-1&search=alice
		const page =
			req.query.page ? parseInt(String(req.query.page), 10) : undefined;
		const limit =
			req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
		const sort =
			req.query.sort ?
				parseInt(String(req.query.sort), 10) === 1 ?
					1
				:	-1
			:	undefined;
		const search = req.query.search ? String(req.query.search) : undefined;

		if (page || limit || sort || search) {
			const { items, total } = await UserService.getUsersPaginated({
				page,
				limit,
				sort,
				search,
			});
			if (!items) throw new NotFoundError('No users found');
			return successResponse(
				res,
				{ items, meta: { total, page: page ?? 1, limit: limit ?? 0 } },
				200,
			);
		}

		const users = await UserService.getAllUsers();
		if (!users) throw new NotFoundError('No users found');
		successResponse(res, users, 200);
	},
};
