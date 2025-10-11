import { ConflictError, NotFoundError } from '../errors';
import { Ingredient } from '../models';
import { IngredientRepository } from '../repositories';
import {
	IngredientInputSchema,
	type IngredientInput,
	type IIngredient,
} from '../schemas';
import type { SearchParams } from '../types';

export const IngredientService = {
	async importIngredientsFromCsv(
		ingredients: Partial<IngredientInput>[],
	): Promise<IIngredient[]> {
		const validIngredients: IngredientInput[] = [];

		for (const ingredient of ingredients) {
			const parsed = IngredientInputSchema.safeParse(ingredient);
			if (parsed.success) {
				validIngredients.push(parsed.data);
			} else {
				console.warn('Invalid ingredient skipped:', parsed.error);
			}
		}
		return await IngredientRepository.insertMany(validIngredients);
	},

	async createIngredient(data: IngredientInput): Promise<void> {
		const existing = await IngredientRepository.findByStrictName(data.name);
		if (existing) {
			throw new ConflictError(
				'An ingredient with this name already exists (case-insensitive check).',
			);
		}
		await IngredientRepository.create(data);
	},

	async getIngredienteByStricName(name: string): Promise<IIngredient> {
		const found = await IngredientRepository.findByStrictName(name);
		if (!found) throw new NotFoundError('Ingredient not found');
		return found;
	},

	async getIngredients(
		params: SearchParams,
	): Promise<IIngredient | IIngredient[]> {
		const { id, query = {}, sort = -1, skip = 0, limit = 10 } = params;
		if (id) {
			const ingredient = await IngredientRepository.findById(id);
			if (!ingredient) throw new NotFoundError('Ingredient not found');
			return ingredient;
		}
		return await Ingredient.find(query)
			.sort({ createdAt: sort })
			.skip(skip)
			.limit(limit);
	},

	async updateIngredient(
		id: string,
		data: Partial<IIngredient>,
	): Promise<void> {
		const existing = await IngredientRepository.findById(id);
		if (!existing) throw new NotFoundError('Ingredient not found');
		await IngredientRepository.updateById(id, data);
	},

	async deleteIngredient(id: string): Promise<void> {
		await IngredientRepository.deleteById(id);
	},

	async validateIngredientIds(ids: string[]): Promise<string[]> {
		const found = await Promise.all(
			ids.map((id) => IngredientRepository.findById(id)),
		);
		const existingIds = found.filter(Boolean).map((i) => i!._id.toString());
		const missing = ids.filter((id) => !existingIds.includes(id));
		return missing;
	},
};
