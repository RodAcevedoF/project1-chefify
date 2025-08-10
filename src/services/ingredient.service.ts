import { ConflictError, NotFoundError } from '../errors';
import { Ingredient } from '../models';
import { IngredientRepository } from '../repositories';
import {
  IngredientInputSchema,
  type IngredientInput,
  type IIngredient,
} from '../schemas';

export const IngredientService = {
  async importIngredientsFromCsv(
    ingredients: Partial<IngredientInput>[]
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
  async createIngredient(data: IngredientInput): Promise<IIngredient> {
    const existing = await IngredientRepository.findByStrictName(data.name);

    if (existing) {
      throw new ConflictError(
        'An ingredient with this name already exists (case-insensitive check).'
      );
    }
    return await IngredientRepository.create(data);
  },

  async getIngredientById(id: string): Promise<IIngredient | null> {
    return await IngredientRepository.findById(id);
  },

  async getIngredienteByStricName(name: string): Promise<IIngredient | null> {
    const found = IngredientRepository.findByStrictName(name);
    return found;
  },

  async getFilteredIngredients(
    query: Record<string, unknown>,
    sort: 1 | -1,
    limit: number,
    skip: number
  ): Promise<IIngredient[]> {
    return await Ingredient.find(query)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);
  },

  async updateIngredient(
    id: string,
    data: Partial<IIngredient>
  ): Promise<IIngredient> {
    const updated = await IngredientRepository.updateById(id, data);
    if (!updated) throw new NotFoundError('Ingredient not found');
    return updated;
  },

  async deleteIngredient(id: string): Promise<IIngredient> {
    const deleted = await IngredientRepository.deleteById(id);
    if (!deleted) throw new NotFoundError('Ingredient not found');
    return deleted;
  },
  async validateIngredientIds(ids: string[]): Promise<string[]> {
    const found = await Promise.all(
      ids.map((id) => IngredientRepository.findById(id))
    );
    const existingIds = found.filter(Boolean).map((i) => i!._id.toString());
    const missing = ids.filter((id) => !existingIds.includes(id));
    return missing;
  },
};
