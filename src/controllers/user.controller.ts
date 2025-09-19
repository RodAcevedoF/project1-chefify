import type { Request, Response } from 'express';
import { UserService } from '../services';
import { successResponse } from '../utils';
import { BadRequestError } from '../errors'; // Asumiendo que tienes estos
import type { UserInput } from '../schemas';

export const UserController = {
	async create(req: Request, res: Response) {
		const data = req.body as UserInput;
		await UserService.createUser(data);
		return successResponse(res, 'User created', 201);
	},

	async getAll(req: Request, res: Response) {
		const users = await UserService.getAllUsers();
		return successResponse(res, users);
	},

	async getById(req: Request, res: Response) {
		const id = req.params.id || req.user?.id;
		if (!id) throw new BadRequestError('ID is required');
		const user = await UserService.getUserById(id);
		return successResponse(res, user);
	},

	async getByEmail(req: Request, res: Response) {
		const { email } = req.query;
		if (!email || typeof email !== 'string') {
			throw new BadRequestError('Email is required in query params');
		}

		const user = await UserService.getUserByEmail(email);
		return successResponse(res, user);
	},

	async update(req: Request, res: Response) {
		const id = req.params.id || req.user?.id;
		const data = req.body as Partial<Omit<UserInput, 'role'>>;

		if (!data || Object.keys(data).length === 0) {
			throw new BadRequestError('Update data is required');
		}
		if (!id) throw new BadRequestError('ID is required');

		await UserService.updateUser(id, data);
		return successResponse(res, 'User updated');
	},

	async delete(req: Request, res: Response) {
		const id = req.params.id || req.user?.id;
		if (!id) throw new BadRequestError('ID is required');

		await UserService.deleteUser(id);
		return successResponse(res, 'User deleted');
	},

	async getUserRecipes(req: Request, res: Response) {
		const id = req.user?.id;
		if (!id) throw new BadRequestError('User ID is required');
		const recipes = await UserService.getCreatedRecipes(id);
		return successResponse(res, recipes);
	},

	async getSavedRecipes(req: Request, res: Response) {
		const id = req.user?.id;
		if (!id) throw new BadRequestError('User ID is required');
		const user = await UserService.getSavedRecipes(id);
		return successResponse(res, user.savedRecipes);
	},

	async saveRecipe(req: Request, res: Response) {
		const { recipeId } = req.params;
		const id = req.user?.id;
		if (!id || !recipeId)
			throw new BadRequestError('User ID and Recipe ID are required');

		await UserService.saveRecipe(id, recipeId);
		return successResponse(res, {
			message: 'Recipe saved successfully',
		});
	},

	async deleteRecipe(req: Request, res: Response) {
		const { recipeId } = req.params;
		const id = req.user?.id;
		if (!id || !recipeId)
			throw new BadRequestError('User ID and Recipe ID are required');

		await UserService.deleteRecipe(id, recipeId);
		return successResponse(res, {
			message: 'Recipe removed from saved list',
		});
	},
};
