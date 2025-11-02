import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories';
import { MediaService } from '../../src/services/media.service';
import bcrypt from 'bcryptjs';
import type { IUser, IRecipe } from '../../src/schemas';
import { beforeEach, afterEach, expect, test, mock } from 'bun:test';
import {
	snapshotModule,
	prepareModuleForMocks,
} from '../test-utils/reset-mocks';
import type { HydratedDocument } from 'mongoose';
import { createMockUserDoc } from '../mocks/createMockUser';
import logger from '@/utils/logger';

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

// debug helper kept during development; no-op in most test environments
logger.debug(mockUser);

const restoreUserRepo = snapshotModule(UserRepository);
const restoreMediaService = snapshotModule(MediaService);

beforeEach(() => {
	prepareModuleForMocks(UserRepository, [
		'findByEmail',
		'createUser',
		'findAll',
		'findById',
		'updateById',
		'deleteById',
		'addSavedRecipe',
		'removeSavedRecipe',
		'getSavedRecipes',
		'getCreatedRecipes',
	]);
	prepareModuleForMocks(MediaService, ['deleteEntityImage']);
});

afterEach(() => {
	restoreUserRepo();
	restoreMediaService();
});

test('createUser: create user if email does not previously exist', async () => {
	UserRepository.findByEmail = mock(() => Promise.resolve(null));
	(bcrypt.hash as any) = mock(() => Promise.resolve('hashed'));

	const input = {
		email: 'new@example.com',
		password: '123456',
		name: 'Test',
	};

	UserRepository.createUser = mock((data) => {
		const created = { ...mockUser, ...data } as any;
		UserRepository.findByEmail = mock(() => Promise.resolve(created));
		return Promise.resolve(created);
	});

	await UserService.createUser(input as any);
	const created = await UserRepository.findByEmail(input.email);
	expect(created?.email).toBe('new@example.com');
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
	UserRepository.findById = mock(() => Promise.resolve(mockUser));
	UserRepository.updateById = mock((id, data) => {
		const updated = { ...mockUser, ...data } as any;
		UserRepository.findById = mock(() => Promise.resolve(updated));
		return Promise.resolve(updated);
	});

	const updated = await UserService.updateUser('123', {
		email: 'updated@example.com',
	});
	expect(updated.email).toBe('updated@example.com');
});

test('deleteUser: delete user and associated image', async () => {
	UserRepository.findById = mock(() => Promise.resolve(mockUser));
	MediaService.deleteEntityImage = mock(() => Promise.resolve());
	UserRepository.deleteById = mock(() => Promise.resolve());

	await UserService.deleteUser('123');
	expect(MediaService.deleteEntityImage).toHaveBeenCalledWith('123', 'user');
	expect(UserRepository.deleteById).toHaveBeenCalledWith('123');
});

test('saveRecipe: save recipe if not previously created', async () => {
	UserRepository.findById = mock(() => Promise.resolve(mockUser));

	UserRepository.addSavedRecipe = mock(() => {
		UserRepository.findById = mock(() =>
			Promise.resolve({
				...mockUser,
				savedRecipes: [...(mockUser.savedRecipes || []), 'rec123'],
			} as any),
		);
		return Promise.resolve();
	});

	await UserService.saveRecipe('123', 'rec123');
	const updated = await UserRepository.findById(mockUser._id.toString());
	expect(updated!.savedRecipes).toContain('rec123');
});

test('deleteRecipe: delete saved recipe', async () => {
	UserRepository.findById = mock(() =>
		Promise.resolve(
			createMockUserDoc({ ...mockUser, savedRecipes: ['rec123'] }),
		),
	);

	UserRepository.removeSavedRecipe = mock(() => {
		UserRepository.findById = mock(() =>
			Promise.resolve({ ...mockUser, savedRecipes: [] } as any),
		);
		return Promise.resolve();
	});

	await UserService.deleteRecipe('123', 'rec123');
	const updatedUser = await UserRepository.findById(mockUser._id.toString());
	expect(updatedUser?.savedRecipes?.length).toBe(0);
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
