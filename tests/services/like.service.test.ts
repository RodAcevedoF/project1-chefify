import { LikeService } from '../../src/services/like.service';
import { LikeRepository } from '../../src/repositories/like.repository';
import { UserService } from '../../src/services/user.service';
import { RecipeRepository } from '../../src/repositories/recipe.repository';
import { beforeEach, afterEach, expect, test, mock } from 'bun:test';
import {
	snapshotModule,
	prepareModuleForMocks,
} from '../test-utils/reset-mocks';

const restoreLikeRepo = snapshotModule(LikeRepository);
const restoreUserService = snapshotModule(UserService);
const restoreRecipeRepo = snapshotModule(RecipeRepository);

beforeEach(() => {
	prepareModuleForMocks(LikeRepository, [
		'create',
		'delete',
		'exists',
		'countForRecipe',
		'getLikesForRecipe',
	]);
	prepareModuleForMocks(UserService, ['getUserById']);
	prepareModuleForMocks(RecipeRepository, ['findById', 'incLikesCount']);
});

afterEach(() => {
	restoreLikeRepo();
	restoreUserService();
	restoreRecipeRepo();
});

test('like: success increments likesCount', async () => {
	UserService.getUserById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	RecipeRepository.findById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	LikeRepository.create = mock(() => Promise.resolve());
	RecipeRepository.incLikesCount = mock(() => Promise.resolve());

	await LikeService.like('u1', 'r1');
	expect(LikeRepository.create).toHaveBeenCalled();
	expect(RecipeRepository.incLikesCount).toHaveBeenCalledWith('r1', 1);
});

test('like: duplicate is idempotent', async () => {
	UserService.getUserById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	RecipeRepository.findById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	LikeRepository.create = mock(() => Promise.reject({ code: 11000 }));
	RecipeRepository.incLikesCount = mock(() => Promise.resolve());

	await LikeService.like('u1', 'r1');
	expect(LikeRepository.create).toHaveBeenCalled();
	expect(RecipeRepository.incLikesCount).not.toHaveBeenCalled();
});

test('like: user not found', async () => {
	UserService.getUserById = mock(() => Promise.resolve(null as any));
	await expect(LikeService.like('u1', 'r1')).rejects.toThrow();
});

test('unlike: delete decrements likesCount when deleted', async () => {
	LikeRepository.delete = mock(() => Promise.resolve({ _id: 'del' } as any));
	RecipeRepository.incLikesCount = mock(() => Promise.resolve());

	await LikeService.unlike('u1', 'r1');
	expect(LikeRepository.delete).toHaveBeenCalledWith('u1', 'r1');
	expect(RecipeRepository.incLikesCount).toHaveBeenCalledWith('r1', -1);
});
