import z from 'zod';

export const RecipeCategories = [
	'vegan',
	'carnivore',
	'high-fat',
	'baked',
	'vegetarian',
	'gluten-free',
	'low-carb',
	'keto',
	'paleo',
	'high-protein',
	'dessert',
	'breakfast',
	'lunch',
	'dinner',
	'snack',
	'soup',
	'pasta',
	'quick-meals',
	'salad',
	'mediterranean',
	'soups',
] as const;

export type RecipeCategory = (typeof RecipeCategories)[number];

export const RecipeCategoryEnum = z.enum(RecipeCategories);
