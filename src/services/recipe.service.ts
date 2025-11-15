import { suggestRecipePrompt, RecipeCategories } from '../data';
import {
	allowedUnits,
	normalizeName,
	unitMap,
	type ingredientPromptType,
	type SearchParams,
} from '../types';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';
import { Recipe } from '../models';
import { RecipeRepository } from '../repositories';
import {
	RecipeInputSchema,
	type RecipeInput,
	type IRecipe,
	type Operation,
} from '../schemas';
import type { IngredientInput } from '../schemas';
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

	async importRecipesFromCsv(recipes: Partial<RecipeInput>[]): Promise<{
		inserted: IRecipe[];
		skipped: { row: number; reason: string; data?: unknown }[];
	}> {
		const validRecipes: RecipeInput[] = [];
		const skipped: { row: number; reason: string; data?: unknown }[] = [];
		const nameToId = new Map<string, string>();

		for (let i = 0; i < recipes.length; i++) {
			const recipe = recipes[i];
			if (!recipe) {
				skipped.push({ row: i + 1, reason: 'empty row', data: null });
				continue;
			}
			try {
				if (!Array.isArray(recipe.ingredients)) {
					logger.warn('Recipe skipped, missing ingredients array:', recipe);
					skipped.push({
						row: i + 1,
						reason: 'missing ingredients array',
						data: recipe,
					});
					continue;
				}

				const normalizedIngredients: {
					ingredient: string;
					quantity: number;
				}[] = [];
				let skipRecipe = false;

				for (const rawIt of recipe.ingredients as unknown[]) {
					const it = rawIt as Record<string, unknown>;
					try {
						const quantity = Number(it['quantity'] ?? it['qty'] ?? 0);
						if (!quantity || isNaN(quantity)) {
							logger.warn('Invalid ingredient quantity, skipping recipe', it);
							skipRecipe = true;
							break;
						}
						const maybeId =
							typeof it['ingredient'] === 'string' ?
								String(it['ingredient']).trim()
							:	'';
						if (/^[0-9a-fA-F]{24}$/.test(maybeId)) {
							normalizedIngredients.push({ ingredient: maybeId, quantity });
							continue;
						}

						// Determine name from possible fields
						const rawName = (it['ingredientName'] ??
							it['name'] ??
							it['ingredient']) as string | undefined;
						if (!rawName || typeof rawName !== 'string') {
							logger.warn(
								'Ingredient name missing or invalid, skipping recipe',
								it,
							);
							skipRecipe = true;
							break;
						}

						const name = normalizeName(rawName);

						let id = nameToId.get(name);
						if (!id) {
							let existing = await IngredientService.findByStrictName(name);
							if (!existing) {
								// determine unit and map synonyms
								let unit: IngredientInput['unit'] = 'unit';
								if (typeof it['unit'] === 'string') {
									const maybe = String(it['unit']).trim().toLowerCase();
									if (maybe in unitMap) {
										unit = unitMap[maybe] as IngredientInput['unit'];
									} else if (
										(allowedUnits as readonly string[]).includes(maybe)
									) {
										unit = maybe as IngredientInput['unit'];
									}
								}

								try {
									await IngredientService.createIngredient({ name, unit });
								} catch (err) {
									logger.debug(
										'Ingredient create conflict or error (ignored):',
										err,
									);
								}
								try {
									existing =
										await IngredientService.getIngredienteByStricName(name);
								} catch (err) {
									logger.warn(
										'Failed to create or fetch ingredient for name',
										name,
										err,
									);
									skipRecipe = true;
									break;
								}
							}
							id = existing._id.toString();
							nameToId.set(name, id);
						}

						normalizedIngredients.push({ ingredient: id!, quantity });
					} catch (err) {
						logger.warn('Error normalizing ingredient', err, it);
						skipRecipe = true;
						break;
					}
				}

				if (skipRecipe) {
					skipped.push({
						row: i + 1,
						reason: 'ingredient normalization failed',
						data: recipe,
					});
					continue;
				}

				const candidate = {
					...recipe,
					ingredients: normalizedIngredients,
				};

				const parsed = RecipeInputSchema.safeParse(candidate);
				if (parsed.success) {
					validRecipes.push(parsed.data);
				} else {
					logger.warn(
						'Invalid recipe skipped after normalization:',
						parsed.error,
					);
					skipped.push({
						row: i + 1,
						reason: 'validation failed',
						data: parsed.error.format ? parsed.error.format() : parsed.error,
					});
				}
			} catch (err) {
				logger.warn(
					'Error processing recipe during import, skipping',
					err,
					recipe,
				);
				skipped.push({ row: i + 1, reason: 'processing error', data: recipe });
			}
		}

		let inserted: IRecipe[] = [];
		if (validRecipes.length) {
			try {
				inserted = await RecipeRepository.insertMany(validRecipes);
			} catch (err) {
				logger.warn('Failed to insert some recipes', err);
				// FIXME: best-effort
				skipped.push({ row: 0, reason: 'insertMany failed', data: err });
			}
		}

		return { inserted, skipped };
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

		if ('imgUrl' in data && !data.imgUrl) {
			try {
				await MediaService.deleteEntityImage(id, 'recipe');
				delete (data as Partial<IRecipe>).imgUrl;
				delete (data as Partial<IRecipe>).imgPublicId;
			} catch (err) {
				logger.warn('Failed to delete recipe image from Cloudinary', err);
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
