import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { Recipe } from "../models";
import { RecipeRepository } from "../repository";
import { RecipeInputSchema, type RecipeInput, type IRecipe } from "../schemas";
import { IngredientService } from "./ingredient.service";
import { MediaService } from "./media.service";

export const RecipeService = {
  async createRecipe(data: RecipeInput): Promise<IRecipe> {
    const existing = await RecipeRepository.findByStrictTitle(data.title);

    if (existing) {
      throw new ConflictError(
        "A recipe with this title already exists (case-insensitive check)."
      );
    }

    const ingredientsId: string[] = data.ingredients.map((i) => i.ingredientId);

    const missingIngredients =
      await IngredientService.validateIngredientIds(ingredientsId);

    if (missingIngredients.length) {
      throw new BadRequestError(
        `Missing ingredient IDs: ${missingIngredients.join(", ")}`
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
        console.warn("Invalid recipe skipped:", parsed.error);
      }
    }

    return await RecipeRepository.insertMany(validRecipes);
  },

  async getAllRecipes(): Promise<IRecipe[]> {
    return await RecipeRepository.findAll();
  },

  async getRecipeById(id: string): Promise<IRecipe | null> {
    return await RecipeRepository.findById(id);
  },

  async getRecipesByTitle(title: string): Promise<IRecipe[]> {
    return await RecipeRepository.findByTitle(title);
  },

  async getRecipesByCategory(category: string): Promise<IRecipe[]> {
    return await RecipeRepository.findByCategory(category);
  },

  async updateRecipe(id: string, data: Partial<IRecipe>): Promise<IRecipe> {
    if (data.title) {
      const existing = await RecipeRepository.findByStrictTitleExcludingId(
        data.title,
        id
      );
      if (existing) {
        throw new ConflictError("Another recipe already uses this title.");
      }
    }

    const updated = await RecipeRepository.updateById(id, data);
    if (!updated) {
      throw new NotFoundError("Recipe not found");
    }

    return updated;
  },

  async deleteRecipe(id: string): Promise<IRecipe> {
    const recipe = RecipeRepository.findById(id);
    if (!recipe) throw new NotFoundError("Recipe not found for deletion");
    await MediaService.deleteEntityImage(id, "recipe");

    const deleted = await RecipeRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("Recipe not found");
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
  }
};
