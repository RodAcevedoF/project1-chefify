import { describe, it, expect } from 'bun:test';
import { setupRepoTestDB } from '../mocks/repoTestSetup';
import { IngredientRepository } from '../../src/repositories';
import type { IngredientInput } from '../../src/schemas';

const dummyIngredient: IngredientInput = {
	_id: '680f1f4e4d3c2b1a2b3c4d5e',
	name: 'Garlic',
	unit: 'cloves',
};

setupRepoTestDB();

describe('IngredientRepository CRUD operations', () => {
	it('should create an ingredient', async () => {
		await IngredientRepository.create(dummyIngredient);
		const ingredient = await IngredientRepository.findById(
			dummyIngredient._id!,
		);
		expect(ingredient).toBeDefined();
		expect(ingredient).not.toBeNull();
		expect(ingredient!.name).toBe(dummyIngredient.name);
	});

	it('should find an ingredient by ID', async () => {
		await IngredientRepository.create(dummyIngredient);
		const ingredient = await IngredientRepository.findById(
			dummyIngredient._id!,
		);
		expect(ingredient).toBeDefined();
		expect(ingredient).not.toBeNull();
		// compare ids as strings
		expect(ingredient!._id.toString()).toBe(dummyIngredient._id!);
	});

	it('should update an ingredient partially or fully', async () => {
		await IngredientRepository.create(dummyIngredient);
		const updated = (await IngredientRepository.updateById(
			dummyIngredient._id!,
			{
				name: 'Black Garlic',
			},
		)) as any;

		expect(updated).toBeDefined();
		expect((updated as any).name).toBe('Black Garlic');
	});

	it("should delete an ingredient and validate it's gone", async () => {
		await IngredientRepository.create(dummyIngredient);

		const deleted = (await IngredientRepository.deleteById(
			dummyIngredient._id!,
		)) as any;
		expect(deleted).toBeDefined();
		expect((deleted as any)._id.toString()).toBe(dummyIngredient._id!);

		const refetch = await IngredientRepository.findById(dummyIngredient._id!);
		expect(refetch).toBeNull();
	});
});
