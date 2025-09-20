import { suggestRecipePrompt } from '../data';
import type { ingredientPromptType, SearchParams } from '../types';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';
import { Recipe } from '../models';
import { RecipeRepository } from '../repositories';
import { RecipeInputSchema, type RecipeInput, type IRecipe } from '../schemas';
import { getSuggestedRecipe } from '../utils';
import { IngredientService } from './ingredient.service';
import { MediaService } from './media.service';

export const RecipeService = {
	async createRecipe(data: RecipeInput): Promise<void> {
		const existing = await RecipeRepository.findByStrictTitle(data.title);
		if (existing) {
			throw new ConflictError(
				'A recipe with this title already exists (case-insensitive check).',
			);
		}
		const ingredientsId: string[] = data.ingredients.map((i) => i.ingredient);
		const missingIngredients =
			await IngredientService.validateIngredientIds(ingredientsId);
		if (missingIngredients.length) {
			throw new BadRequestError(
				`Missing ingredient IDs: ${missingIngredients.join(', ')}`,
			);
		}
		await RecipeRepository.create(data);
	},

	async importRecipesFromCsv(
		recipes: Partial<RecipeInput>[],
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

	async updateRecipe(id: string, data: Partial<IRecipe>): Promise<void> {
		if (data.title) {
			const existing = await RecipeRepository.findByStrictTitleExcludingId(
				data.title,
				id,
			);
			if (existing) {
				throw new ConflictError('Another recipe already uses this title.');
			}
		}
		const recipe = await RecipeRepository.findById(id);
		if (!recipe) {
			throw new NotFoundError('Recipe not found');
		}
		await RecipeRepository.updateById(id, data);
	},

	async deleteRecipe(id: string): Promise<void> {
		const recipe = RecipeRepository.findById(id);
		if (!recipe) throw new NotFoundError('Recipe not found for deletion');
		await MediaService.deleteEntityImage(id, 'recipe');
		await RecipeRepository.deleteById(id);
	},

	async getRecipes(params: SearchParams): Promise<IRecipe | IRecipe[]> {
		const { id, query = {}, sort = -1, skip = 0, limit = 10 } = params;
		if (id) {
			const recipe = await RecipeRepository.findById(id);
			if (!recipe) throw new NotFoundError('Recipe not found');
			return recipe;
		}
		return await Recipe.find(query)
			.populate('ingredients.ingredient')
			.populate('userId', 'name')
			.sort({ createdAt: sort })
			.skip(skip)
			.limit(limit);
	},

	async generateSuggestedRecipe(): Promise<RecipeInput> {
		const raw = await getSuggestedRecipe(suggestRecipePrompt);
		if (!Array.isArray(raw.ingredients)) {
			throw new BadRequestError(
				"Missing or invalid 'ingredients' array from AI",
			);
		}
		const ingredientResults = await Promise.all(
			raw.ingredients.map(
				async ({ name, quantity, unit }: ingredientPromptType) => {
					if (!name || typeof quantity !== 'number') {
						throw new BadRequestError('Invalid ingredient format from AI');
					}
					let existing =
						await IngredientService.getIngredienteByStricName(name);
					existing ??
						(await IngredientService.createIngredient({
							name: name,
							unit: unit,
						}));
					const ingredient =
						await IngredientService.getIngredienteByStricName(name);
					if (!ingredient)
						throw new BadRequestError(
							'Failed to create or retrieve ingredient',
						);

					return {
						ingredient: ingredient._id.toString(),
						quantity,
					};
				},
			),
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
