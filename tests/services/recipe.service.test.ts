import { RecipeService } from '../../src/services/recipe.service';
import { RecipeRepository } from '../../src/repositories';
import { IngredientService } from '../../src/services/ingredient.service';
import type { IRecipe, RecipeInput } from '../../src/schemas';
import { ConflictError, BadRequestError } from '../../src/errors';
import { beforeEach, afterEach, expect, test, mock } from 'bun:test';
import {
	snapshotModule,
	prepareModuleForMocks,
} from '../test-utils/reset-mocks';

const mockRecipe = {
	_id: '6412d6789521364578965412',
	title: 'cheesecake',
	ingredients: [{ ingredient: 'queso' }],
	createdAt: new Date(),
	updatedAt: new Date(),
} as IRecipe;

const restoreRecipeRepo = snapshotModule(RecipeRepository);
const restoreIngredientService = snapshotModule(IngredientService);

beforeEach(() => {
	prepareModuleForMocks(RecipeRepository, ['findByStrictTitle', 'create']);
	prepareModuleForMocks(IngredientService, ['validateIngredientIds']);
});

afterEach(() => {
	restoreRecipeRepo();
	restoreIngredientService();
});

test('createRecipe: throws conflict error if title already exists', async () => {
	RecipeRepository.findByStrictTitle = mock(() => Promise.resolve(mockRecipe));

	const data = {
		title: 'Tarta de queso',
		ingredients: [{ ingredient: 'queso' }],
	} as RecipeInput;

	await expect(RecipeService.createRecipe(data)).rejects.toThrow(ConflictError);
});

test('createRecipe: throws BadRequestError if ingredients are not valid', async () => {
	RecipeRepository.findByStrictTitle = mock(() => Promise.resolve(null));
	IngredientService.validateIngredientIds = mock(() =>
		Promise.resolve(['x1', 'x2']),
	);

	const data = {
		title: 'Tarta falsa',
		ingredients: [{ ingredient: 'x1' }, { ingredient: 'x2' }],
	} as RecipeInput;

	await expect(RecipeService.createRecipe(data)).rejects.toThrow(
		BadRequestError,
	);
});

test('createRecipe: create recipe if fullfills validations', async () => {
	RecipeRepository.findByStrictTitle = mock(() => Promise.resolve(null));
	IngredientService.validateIngredientIds = mock(() => Promise.resolve([]));
	RecipeRepository.create = mock((data) =>
		Promise.resolve({ ...mockRecipe, ...data }),
	);

	const data = {
		title: 'Creative tart',
		ingredients: [{ ingredient: 'fresa' }],
	} as RecipeInput;

	await RecipeService.createRecipe(data);
	await RecipeService.createRecipe(data);
	expect(RecipeRepository.create).toHaveBeenCalled();
	const created = await (RecipeRepository.create as any)(data as any);
	expect((created as any).title).toBe('Creative tart');
});
