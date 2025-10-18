import { Schema } from 'mongoose';
import { z } from 'zod';
import { RecipeCategories, RecipeCategoryEnum } from '../data';

export const recipeSchema = new Schema<IRecipe>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
		title: { type: String, required: true, unique: true },
		ingredients: [
			{
				ingredient: {
					type: Schema.Types.ObjectId,
					ref: 'Ingredient',
					required: true,
				},
				quantity: { type: Number, required: true },
			},
		],
		instructions: { type: [String], required: true },
		categories: {
			type: [String],
			enum: RecipeCategories,
			default: [],
		},
		imgUrl: { type: String, required: false },
		imgPublicId: { type: String, required: false },
		servings: { type: Number },
		prepTime: { type: Number },
		utensils: { type: [String], default: [] },
	},
	{ timestamps: true },
);

export const IngredientRecipeSchema = z.object({
	ingredient: z.string().length(24),
	quantity: z.number().positive(),
	_id: z.string().length(24).optional(),
});

export const RecipeInputSchema = z
	.object({
		title: z.string().min(1).trim(),
		ingredients: z.array(IngredientRecipeSchema).min(1),
		instructions: z.array(z.string().min(1).trim()).min(1),
		categories: z.array(RecipeCategoryEnum).optional(),
		imgUrl: z.string().optional(),
		imgPublicId: z.string().optional(),
		userId: z.string().optional(),
		servings: z.number().int().positive().optional(),
		prepTime: z.number().int().positive().optional(),
		utensils: z.array(z.string().trim()).optional(),
	})
	.strict();

export type RecipeInput = z.infer<typeof RecipeInputSchema>;

export type IRecipe = RecipeInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

recipeSchema.index({ title: 'text', instructions: 'text' });
recipeSchema.index({ createdAt: -1 });
