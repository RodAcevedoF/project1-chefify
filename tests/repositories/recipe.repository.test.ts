import { describe, it, expect, afterEach } from 'bun:test';
import { RecipeRepository } from '@/repositories';
import { RecipeInputSchema, type RecipeInput } from '@/schemas';
import { setupRepoTestDB } from '../mocks/repoTestSetup';
import { dummyRecipes } from '../mocks/seedMockRecipes';

const dummy: RecipeInput = RecipeInputSchema.parse(dummyRecipes[0]);
const dummyBeta: RecipeInput = RecipeInputSchema.parse(dummyRecipes[1]);

setupRepoTestDB();

describe('RecipeRepository CRUD operations', () => {
	it('should create and retrieve a recipe', async () => {
		await RecipeRepository.create(dummy);
		const created = await RecipeRepository.findByStrictTitle(dummy.title);
		expect(created).toBeDefined();
		expect(created?.title).toBe(dummy.title);

		const found =
			created ? await RecipeRepository.findById(created._id.toString()) : null;
		expect(found?.title).toBe(dummy.title);
	});

	it('should update a user partially or fully', async () => {
		await RecipeRepository.create(dummyBeta);
		const created = await RecipeRepository.findByStrictTitle(dummyBeta.title);
		if (!created || !created._id) throw new Error('Data not found');
		await RecipeRepository.updateById(created._id.toString(), {
			title: 'Garlic rustic cream',
		});
		const updated = await RecipeRepository.findById(created._id.toString());
		expect(updated).toBeDefined();
		expect(updated!.title).toBe('Garlic rustic cream');
	});

	it('should retrieve all recipes', async () => {
		await RecipeRepository.create(dummy);
		await RecipeRepository.create(dummyBeta);
		const r1 = await RecipeRepository.findByStrictTitle(dummy.title);
		const r2 = await RecipeRepository.findByStrictTitle(dummyBeta.title);
		expect(r1).toBeDefined();
		expect(r2).toBeDefined();
	});

	it('should retrieve a specific recipe through a strict name', async () => {
		await RecipeRepository.create(dummy);
		const recipe = await RecipeRepository.findByStrictTitle(dummy.title);
		expect(recipe?.title).toBe(dummy.title);
	});

	it('should delete a recipe', async () => {
		await RecipeRepository.create(dummyBeta);
		const created = await RecipeRepository.findByStrictTitle(dummyBeta.title);
		if (!created || !created._id) throw new Error('Created recipe not found');
		await RecipeRepository.deleteById(created._id.toString());

		const shouldBeGone = await RecipeRepository.findById(
			created._id.toString(),
		);
		expect(shouldBeGone).toBeNull();
	});
});
