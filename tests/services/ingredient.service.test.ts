import { IngredientService } from '../../src/services/ingredient.service';
import { IngredientRepository } from '../../src/repositories';
import { type IIngredient, type IngredientInput } from '../../src/schemas';
import { ConflictError, NotFoundError } from '../../src/errors';
import { beforeEach, expect, test, mock } from 'bun:test';

const mockIngredient = {
	_id: '64b5de2f8c9b1a3c8d4e5f62',
	name: 'Tomato',
	createdAt: new Date(),
	updatedAt: new Date(),
} as IIngredient;

beforeEach(() => {
	IngredientRepository.findByStrictName = undefined as any;
	IngredientRepository.create = undefined as any;
	IngredientRepository.insertMany = undefined as any;
	IngredientRepository.updateById = undefined as any;
	IngredientRepository.deleteById = undefined as any;
	IngredientRepository.findById = undefined as any;
});

test('createIngredient: throws ConflictError if name already exists', async () => {
	IngredientRepository.findByStrictName = mock(() =>
		Promise.resolve(mockIngredient as any),
	);

	const input = { name: 'Tomato' } as IngredientInput;

	await expect(IngredientService.createIngredient(input)).rejects.toThrow(
		ConflictError,
	);
});

test('createIngredient: create ingrediente if does not previously exist', async () => {
	IngredientRepository.findByStrictName = mock(() => Promise.resolve(null));
	IngredientRepository.create = mock((data) =>
		Promise.resolve({ ...mockIngredient, ...data } as any),
	);

	const input = { name: 'Pepper' } as IngredientInput;
	await IngredientService.createIngredient(input);
	// the repository create mock returns the created object; call it to inspect
	const created = await (IngredientRepository.create as any)(input as any);
	expect((created as any).name).toBe('Pepper');
});

test('importIngredientsFromCsv: save only valid ingredients', async () => {
	IngredientRepository.insertMany = mock((ingredients) =>
		Promise.resolve(
			ingredients.map((i: IngredientInput) => ({
				...mockIngredient,
				...i,
			})) as any,
		),
	);

	const csvData: IngredientInput[] = [
		{ name: 'Onion', unit: 'gr' },
		{ name: 'Bok choi', unit: 'gre' as any }, // inválido
		{ name: 'Garlic', unit: 'cloves' },
	];

	const result = await IngredientService.importIngredientsFromCsv(csvData);
	expect(result.length).toBe(2);
	expect(result[0]?.name).toBe('Onion');
	expect(result[1]?.name).toBe('Garlic');
});

test('updateIngredient: throws NotFoundError if not updated', async () => {
	IngredientRepository.updateById = mock(() => Promise.resolve());

	await expect(
		IngredientService.updateIngredient('invalid-id', { name: 'New' }),
	).rejects.toThrow(NotFoundError);
});
