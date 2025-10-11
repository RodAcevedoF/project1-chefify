import { UserRepository } from '../repositories';
import type { UserInput, IUser, IRecipe } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';
import { MediaService } from './media.service';
import { sanitizeUser } from '../utils';

export const UserService = {
	async createUser(data: UserInput): Promise<void> {
		const existing = await UserRepository.findByEmail(data.email);
		if (existing) throw new BadRequestError('Email already exists');
		await UserRepository.createUser(data);
		const created = await UserRepository.findByEmail(data.email);
		if (!created) throw new BadRequestError('Failed to create user');
	},

	async getAllUsers(): Promise<IUser[]> {
		return await UserRepository.findAll();
	},

	async getUserById(id: string): Promise<Omit<IUser, 'password'>> {
		const user = await UserRepository.findById(id);
		if (!user) throw new NotFoundError('User not found');
		return sanitizeUser(user);
	},

	async getUserByEmail(email: string): Promise<Omit<IUser, 'password'>> {
		const user = await UserRepository.findByEmail(email);
		if (!user) throw new NotFoundError(`No user with email ${email}`);
		return sanitizeUser(user);
	},

	async updateUser(
		id: string,
		data: Partial<Omit<UserInput, 'role'>>,
	): Promise<Omit<IUser, 'password'>> {
		if ('role' in data) delete (data as Partial<UserInput>).role;
		const existing = await UserRepository.findById(id);
		if (!existing) throw new NotFoundError('User not found');
		await UserRepository.updateById(id, data);
		const updated = await UserRepository.findById(id);
		if (!updated) throw new NotFoundError('User not found after update');
		return sanitizeUser(updated);
	},

	async deleteUser(id: string): Promise<void> {
		const user = await UserRepository.findById(id);
		if (!user) throw new NotFoundError('User not found for deletion');
		await MediaService.deleteEntityImage(id, 'user');
		await UserRepository.deleteById(id);
	},

	async saveRecipe(userId: string, recipeId: string): Promise<void> {
		const user = await UserRepository.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		const alreadySaved = user.savedRecipes?.includes(recipeId);
		if (alreadySaved) {
			throw new BadRequestError('Recipe already saved');
		}

		await UserRepository.addSavedRecipe(userId, recipeId);
		const updated = await UserRepository.findById(userId);
		if (!updated) throw new NotFoundError('User not found after saving recipe');
	},

	async deleteRecipe(userId: string, recipeId: string): Promise<void> {
		const user = await UserRepository.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		await UserRepository.removeSavedRecipe(userId, recipeId);
		const updated = await UserRepository.findById(userId);
		if (!updated)
			throw new NotFoundError('User not found after removing recipe');
	},

	async getSavedRecipes(userId: string): Promise<IUser> {
		const user = await UserRepository.getSavedRecipes(userId);
		if (!user) throw new NotFoundError('Recipes not found');
		return user;
	},

	async getCreatedRecipes(userId: string): Promise<IRecipe[]> {
		const recipes = await UserRepository.getCreatedRecipes(userId);
		if (!recipes) throw new NotFoundError('Recipes not found');
		return recipes;
	},
};
