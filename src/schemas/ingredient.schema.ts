import { z } from 'zod';
import { Schema } from 'mongoose';

export const IngredientSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
		name: { type: String, required: true, unique: true, trim: true },
		unit: { type: String, required: true },
	},
	{ timestamps: true },
);

export const IngredientInputSchema = z
	.object({
		_id: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/)
			.optional(),
		userId: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/)
			.optional(),
		name: z.string().min(2).trim(),
		unit: z.enum(['gr', 'ml', 'tsp', 'tbsp', 'cloves', 'unit']),
	})
	.strict();

export type IngredientInput = z.infer<typeof IngredientInputSchema>;

export type IIngredient = IngredientInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

IngredientSchema.index({ name: 1 });
IngredientSchema.index({ name: 'text' });
IngredientSchema.index({ createdAt: -1 });
