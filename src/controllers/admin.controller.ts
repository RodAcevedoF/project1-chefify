import type { Request, Response } from 'express';
import { ForbiddenError, BadRequestError, NotFoundError } from '../errors';
import {
	successResponse,
	readRecipeCsv,
	readIngredient,
	readUsersCsv,
} from '../utils';
import { IngredientService, RecipeService, UserService } from '../services';
import ImportsService from '../services/imports.service';
import { Recipe } from '../models';

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

		const { inserted, skipped } =
			await RecipeService.importRecipesFromCsv(records);

		return successResponse(res, { inserted, skipped }, 201);
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

		return successResponse(res, { inserted }, 201);
	},
	async importUsers(req: Request, res: Response) {
		if (req.user?.role !== 'admin') {
			throw new ForbiddenError('Only admins can import users');
		}

		const file = req.file;
		if (!file) throw new BadRequestError('No file uploaded');

		const records = await readUsersCsv(file as Express.Multer.File);
		if (!records.length) {
			throw new BadRequestError('No valid users found in file');
		}

		const { inserted, skipped } = await UserService.importUsersFromCsv(records);

		return successResponse(res, { inserted, skipped }, 201);
	},
	async getUsersTemplate(req: Request, res: Response) {
		if (req.user?.role !== 'admin') {
			throw new ForbiddenError('Only admins can download templates');
		}

		const format = String(req.query.format ?? 'csv').toLowerCase() as
			| 'csv'
			| 'xlsx';
		const template = ImportsService.buildUsersTemplate(format);

		if (template.type === 'xlsx') {
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${template.filename}"`,
			);
			res.type(template.mime);
			return res.send(template.buffer);
		}

		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${template.filename}"`,
		);
		res.type(template.mime);
		return res.send(template.csv);
	},

	async getRecipesTemplate(req: Request, res: Response) {
		if (req.user?.role !== 'admin') {
			throw new ForbiddenError('Only admins can download templates');
		}

		const format = String(req.query.format ?? 'csv').toLowerCase() as
			| 'csv'
			| 'xlsx';
		const template = ImportsService.buildRecipesTemplate(format);

		if (template.type === 'xlsx') {
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${template.filename}"`,
			);
			res.type(template.mime);
			return res.send(template.buffer);
		}

		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${template.filename}"`,
		);
		res.type(template.mime);
		return res.send(template.csv);
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
	async getRecipes(req: Request, res: Response) {
		// ?page=1&limit=20&sort=-1&search=chicken
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

		const query: Record<string, unknown> = {};
		if (search) query.title = { $regex: search, $options: 'i' };

		const skip = page && limit ? (page - 1) * limit : 0;

		const items = await RecipeService.getRecipes({ query, sort, skip, limit });
		if (!items) throw new NotFoundError('No recipes found');

		const total = await Recipe.countDocuments(query as Record<string, unknown>);
		return successResponse(
			res,
			{ items, meta: { total, page: page ?? 1, limit: limit ?? 0 } },
			200,
		);
	},
};
