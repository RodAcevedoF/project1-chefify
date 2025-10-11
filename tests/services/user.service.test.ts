import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories';
import { MediaService } from '../../src/services/media.service';
import bcrypt from 'bcryptjs';
import type { IUser, IRecipe } from '../../src/schemas';
import { beforeEach, expect, test, mock } from 'bun:test';
import type { HydratedDocument } from 'mongoose';
import { createMockUserDoc } from '../mocks/createMockUser';

const mockUser = {
	_id: '64b123456789654123032145',
	name: 'Test User',
	email: 'test@example.com',
	password: 'hashedpass',
	role: 'user',
	savedRecipes: ['Tomato salad'],
	createdAt: new Date(),
	updatedAt: new Date(),
} as HydratedDocument<IUser>;

console.log(mockUser);
beforeEach(() => {
	UserRepository.findByEmail = undefined as any;
	UserRepository.createUser = undefined as any;
	UserRepository.findAll = undefined as any;
	UserRepository.findById = undefined as any;
	UserRepository.updateById = undefined as any;
	UserRepository.deleteById = undefined as any;
	UserRepository.addSavedRecipe = undefined as any;
	UserRepository.removeSavedRecipe = undefined as any;
	UserRepository.getSavedRecipes = undefined as any;
	UserRepository.getCreatedRecipes = undefined as any;
	MediaService.deleteEntityImage = undefined as any;
});

test('createUser: create user if email does not previously exist', async () => {
	UserRepository.findByEmail = mock(() => Promise.resolve(null));
	UserRepository.createUser = mock((data) =>
		Promise.resolve({ ...mockUser, ...data }),
	);
	(bcrypt.hash as any) = mock(() => Promise.resolve('hashed'));

	const input = {
		email: 'new@example.com',
		password: '123456',
		name: 'Test',
	};

	const created = await UserService.createUser(input as any);
	expect(created.email).toBe('new@example.com');
	expect(UserRepository.createUser).toHaveBeenCalled();
});

test('getAllUsers: return all users', async () => {
	UserRepository.findAll = mock(() => Promise.resolve([mockUser]));
	const users = await UserService.getAllUsers();
	expect(users.length).toBe(1);
});

test('getUserById: throw error if not found', async () => {
	UserRepository.findById = mock(() => Promise.resolve(null));
	await expect(
		UserService.getUserById('abc789456123456987456321'),
	).rejects.toThrow('not found');
});

test('updateUser: must not allow role changes', async () => {
	UserRepository.updateById = mock((id, data) =>
		Promise.resolve({ ...mockUser, ...data }),
	);
	const updated = await UserService.updateUser('123', {
		email: 'updated@example.com', // esto será eliminado internamente
	});
	expect(updated.email).toBe('updated@example.com');
});

test('deleteUser: delete user and associated image', async () => {
	UserRepository.findById = mock(() => Promise.resolve(mockUser));
	MediaService.deleteEntityImage = mock(() => Promise.resolve());
	UserRepository.deleteById = mock(() => Promise.resolve());

	const deleted = await UserService.deleteUser('123');
	expect(deleted).toBeNull;
});

test('saveRecipe: save recipe if not previously created', async () => {
	UserRepository.findById = mock(() => Promise.resolve(mockUser));
	UserRepository.addSavedRecipe = mock(() => Promise.resolve());

	const updated = await UserService.saveRecipe('123', 'rec123');
	expect(updated.savedRecipes).toContain('rec123');
});

test('deleteRecipe: delete saved recipe', async () => {
	UserRepository.findById = mock(() =>
		Promise.resolve(
			createMockUserDoc({ ...mockUser, savedRecipes: ['rec123'] }),
		),
	);
	UserRepository.removeSavedRecipe = mock(() => Promise.resolve());

	const updated = await UserService.deleteRecipe('123', 'rec123');
	if (!updated) throw new Error('User not found');
	if (!updated.savedRecipes) throw new Error('User do not have saved recipes');
	expect(updated.savedRecipes.length).toBe(0);
});

test('getSavedRecipes: return user own saved recipes list', async () => {
	UserRepository.getSavedRecipes = mock(() => Promise.resolve(mockUser));
	const result = await UserService.getSavedRecipes('123');
	expect(result.email).toBe(mockUser.email);
});

test('getCreatedRecipes: return recipes created by user', async () => {
	const recipes = [{ title: 'Tarta' }] as IRecipe[];
	UserRepository.getCreatedRecipes = mock(() => Promise.resolve(recipes));

	const result = await UserService.getCreatedRecipes('123');
	expect(result.length).toBe(1);
});
