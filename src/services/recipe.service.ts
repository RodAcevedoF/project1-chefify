import { suggestRecipePrompt } from '../data';
import type { ingredientPromptType } from '../types';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';
import { Recipe } from '../models';
import { RecipeRepository } from '../repositories';
import { RecipeInputSchema, type RecipeInput, type IRecipe } from '../schemas';
import { getSuggestedRecipe } from '../utils';
import { IngredientService } from './ingredient.service';
import { MediaService } from './media.service';

export const RecipeService = {
  async createRecipe(data: RecipeInput): Promise<IRecipe> {
    const existing = await RecipeRepository.findByStrictTitle(data.title);

    if (existing) {
      throw new ConflictError(
        'A recipe with this title already exists (case-insensitive check).'
      );
    }

    const ingredientsId: string[] = data.ingredients.map((i) => i.ingredient);

    const missingIngredients =
      await IngredientService.validateIngredientIds(ingredientsId);

    if (missingIngredients.length) {
      throw new BadRequestError(
        `Missing ingredient IDs: ${missingIngredients.join(', ')}`
      );
    }

    return await RecipeRepository.create(data);
  },

  async importRecipesFromCsv(
    recipes: Partial<RecipeInput>[]
  ): Promise<RecipeInput[]> {
    const validRecipes: RecipeInput[] = [];

    for (const recipe of recipes) {
      const parsed = RecipeInputSchema.safeParse(recipe);
      if (parsed.success) {
        validRecipes.push(parsed.data);
      } else {
        console.warn('Invalid recipe skipped:', parsed.error);
      }
    }

    return await RecipeRepository.insertMany(validRecipes);
  },

  async getRecipeById(id: string): Promise<IRecipe | null> {
    return await RecipeRepository.findById(id);
  },

  async updateRecipe(id: string, data: Partial<IRecipe>): Promise<IRecipe> {
    if (data.title) {
      const existing = await RecipeRepository.findByStrictTitleExcludingId(
        data.title,
        id
      );
      if (existing) {
        throw new ConflictError('Another recipe already uses this title.');
      }
    }

    const updated = await RecipeRepository.updateById(id, data);
    if (!updated) {
      throw new NotFoundError('Recipe not found');
    }

    return updated;
  },

  async deleteRecipe(id: string): Promise<IRecipe> {
    const recipe = RecipeRepository.findById(id);
    if (!recipe) throw new NotFoundError('Recipe not found for deletion');
    await MediaService.deleteEntityImage(id, 'recipe');

    const deleted = await RecipeRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('Recipe not found');
    }
    return deleted;
  },

  async getFilteredRecipes(
    query: Record<string, unknown>,
    sort: 1 | -1,
    limit: number,
    skip: number
  ): Promise<IRecipe[]> {
    return await Recipe.find(query)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);
  },

  async generateSuggestedRecipe(): Promise<RecipeInput> {
    const raw = await getSuggestedRecipe(suggestRecipePrompt);

    if (!Array.isArray(raw.ingredients)) {
      throw new BadRequestError(
        "Missing or invalid 'ingredients' array from AI"
      );
    }
    const ingredientResults = await Promise.all(
      raw.ingredients.map(
        async ({ name, quantity, unit }: ingredientPromptType) => {
          if (!name || typeof quantity !== 'number') {
            throw new BadRequestError('Invalid ingredient format from AI');
          }

          const existing =
            await IngredientService.getIngredienteByStricName(name);

          const ingredient =
            existing ??
            (await IngredientService.createIngredient({
              name: name,
              unit: unit,
            }));

          return {
            ingredient: ingredient._id.toString(),
            quantity,
          };
        }
      )
    );

    const recipeData: Partial<RecipeInput> = {
      title: raw.title,
      instructions: raw.instructions,
      ingredients: ingredientResults,
      categories: raw.categories ?? [],
      imgUrl: raw.imgUrl,
      imgPublicId: raw.imgPublicId,
      servings: raw.servings ?? 1,
      prepTime: raw.prepTime ?? 30,
      utensils: raw.utensils ?? [],
    };

    const parsed = RecipeInputSchema.safeParse(recipeData);
    if (!parsed.success) {
      console.warn('Zod validation failed for AI recipe:', parsed.error);
      throw new BadRequestError('Invalid recipe format after processing');
    }

    return parsed.data;
  },
};
