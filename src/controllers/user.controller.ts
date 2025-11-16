import type { Request, Response } from 'express';
import type { ExtendedRequest } from '../types';
import { UserService } from '../services';
import { sendEmail } from '../services/email.service';
import { successResponse } from '../utils';
import { BadRequestError } from '../errors'; // Asumiendo que tienes estos
import type { UserInput } from '../schemas';
import { extractPayload, extractFileBuffer } from '../utils/requestBody';

export const UserController = {
	async create(req: ExtendedRequest, res: Response) {
		const data = extractPayload(req.body) as UserInput;
		const fileBuffer = extractFileBuffer(req);

		await UserService.createUser(data, fileBuffer);
		return successResponse(res, 'User created', 201);
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

	async update(req: ExtendedRequest, res: Response) {
		const id = req.params.id || req.user?.id;
		let updateData: Partial<Omit<UserInput, 'role'>> = extractPayload(
			req.body,
		) as Partial<Omit<UserInput, 'role'>>;

		if (!updateData || Object.keys(updateData).length === 0) {
			throw new BadRequestError('Update data is required');
		}
		if (!id) throw new BadRequestError('ID is required');

		const fileBuffer = extractFileBuffer(req);

		await UserService.updateUser(id, updateData, fileBuffer);
		return successResponse(res, 'User updated', 204);
	},

	async delete(req: Request, res: Response) {
		const id = req.params.id || req.user?.id;
		if (!id) throw new BadRequestError('ID is required');

		await UserService.deleteUser(id);
		return successResponse(res, 'User deleted');
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

	async getCreatedRecipes(req: Request, res: Response) {
		const id = req.user?.id;
		if (!id) throw new BadRequestError('User ID is required');
		const recipes = await UserService.getCreatedRecipes(id);
		return successResponse(res, recipes);
	},

	async getRecentOperations(req: Request, res: Response) {
		const id = req.user?.id;
		if (!id) throw new BadRequestError('User ID is required');
		const ops = await UserService.getRecentOperations(id);
		return successResponse(res, ops);
	},

	async contact(req: Request, res: Response) {
		const { name, replyTo, message } = req.body ?? {};
		if (!name || !replyTo || !message) {
			throw new BadRequestError('name, replyTo and message are required');
		}

		const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
		if (!to)
			throw new BadRequestError('Contact email recipient not configured');
		await sendEmail({
			to,
			type: 'CONTACT',
			payload: { name, replyTo, message },
		});

		return successResponse(res, { message: 'Message sent' });
	},
};
