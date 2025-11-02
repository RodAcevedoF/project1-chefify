import { suggestRecipePrompt, RecipeCategories } from '../data';
import type { ingredientPromptType, SearchParams } from '../types';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';
import { Recipe } from '../models';
import { RecipeRepository } from '../repositories';
import {
	RecipeInputSchema,
	type RecipeInput,
	type IRecipe,
	type Operation,
} from '../schemas';
import { getSuggestedRecipe, mediaEntityConfig } from '../utils';
import { IngredientService } from './ingredient.service';
import { MediaService } from './media.service';
import { UserService } from './user.service';
import logger from '../utils/logger';

export const RecipeService = {
	async createRecipe(
		data: RecipeInput,
		userId?: string,
		fileBuffer?: Buffer,
	): Promise<void> {
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

		if (fileBuffer) {
			try {
				const folder = mediaEntityConfig.recipe.folder;
				const uploadResult = await MediaService.upload(fileBuffer, folder);
				data = {
					...data,
					imgUrl: uploadResult.url,
					imgPublicId: uploadResult.publicId,
				} as RecipeInput;
			} catch (err) {
				throw err;
			}
		}

		await RecipeRepository.create(data);

		if (!userId) return;
		try {
			const created = await RecipeRepository.findByStrictTitle(data.title);
			if (created) {
				const op: Operation = {
					type: 'create',
					resource: 'recipe',
					resourceId: (created as IRecipe)._id?.toString(),
					summary: `Created recipe ${created.title}`,
					meta: {},
					createdAt: new Date(),
				};
				await UserService.recordOperation(userId, op);
			}
		} catch (err) {
			logger.warn('Failed to record create operation for user', err);
		}
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
				logger.warn('Invalid recipe skipped:', parsed.error);
			}
		}
		return await RecipeRepository.insertMany(validRecipes);
	},

	async updateRecipe(
		id: string,
		data: Partial<IRecipe>,
		userId?: string,
		fileBuffer?: Buffer,
	): Promise<void> {
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

		if (fileBuffer) {
			try {
				await MediaService.replaceEntityImage({
					entityId: id,
					type: 'recipe',
					buffer: fileBuffer,
				});

				if ('imgUrl' in data) delete (data as Partial<IRecipe>).imgUrl;
				if ('imgPublicId' in data)
					delete (data as Partial<IRecipe>).imgPublicId;
			} catch (err) {
				throw err;
			}
		}

		await RecipeRepository.updateById(id, data);

		if (!userId) return;
		try {
			const op: Operation = {
				type: 'update',
				resource: 'recipe',
				resourceId: id,
				summary: `Updated recipe ${id}`,
				meta: { fields: Object.keys(data || {}) },
				createdAt: new Date(),
			};
			await UserService.recordOperation(userId, op);
		} catch (err) {
			logger.warn('Failed to record update operation for user', err);
		}
	},

	async deleteRecipe(id: string, userId?: string): Promise<void> {
		const recipe = await RecipeRepository.findById(id);
		if (!recipe) throw new NotFoundError('Recipe not found for deletion');
		await MediaService.deleteEntityImage(id, 'recipe');
		await RecipeRepository.deleteById(id);

		if (!userId) return;
		try {
			const op: Operation = {
				type: 'delete',
				resource: 'recipe',
				resourceId: id,
				summary: `Deleted recipe ${id}`,
				meta: {},
				createdAt: new Date(),
			};
			await UserService.recordOperation(userId, op);
		} catch (err) {
			logger.warn('Failed to record delete operation for user', err);
		}
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
			.populate('userId')
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

					let existing = await IngredientService.findByStrictName(name);
					if (!existing) {
						await IngredientService.createIngredient({ name, unit });
						existing = await IngredientService.getIngredienteByStricName(name);
					}
					const ingredient = existing;
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
			categories: ((): (typeof RecipeCategories)[number][] => {
				const allowed = RecipeCategories as readonly string[];
				if (!Array.isArray(raw.categories))
					return ['dinner'] as unknown as (typeof RecipeCategories)[number][];
				const seen = new Set<string>();
				const normalized: string[] = [];
				for (const c of raw.categories) {
					if (typeof c !== 'string') continue;
					let s = c.trim().toLowerCase();
					s = s.replace(/\s+/g, '-');
					if (s.endsWith('s') && !allowed.includes(s)) s = s.slice(0, -1);
					if (s === 'meat-based' || s === 'meat') s = 'carnivore';
					if (allowed.includes(s) && !seen.has(s)) {
						seen.add(s);
						normalized.push(s);
						if (normalized.length >= 4) break;
					}
				}
				if (normalized.length === 0) {
					return ['dinner'] as unknown as (typeof RecipeCategories)[number][];
				}
				return normalized as unknown as (typeof RecipeCategories)[number][];
			})(),
			imgUrl: raw.imgUrl,
			imgPublicId: raw.imgPublicId,
			servings: raw.servings ?? 1,
			prepTime: raw.prepTime ?? 30,
			utensils: raw.utensils ?? [],
		};

		const parsed = RecipeInputSchema.safeParse(recipeData);
		if (!parsed.success) {
			logger.warn('Zod validation failed for AI recipe:', parsed.error);
			throw new BadRequestError('Invalid recipe format after processing');
		}
		return parsed.data;
	},
};
