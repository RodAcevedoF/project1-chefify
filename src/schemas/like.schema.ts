import { Schema } from 'mongoose';
import { z } from 'zod';

export const LikeSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
	},
	{ timestamps: true },
);

export const LikeInputSchema = z
	.object({
		_id: z.string().length(24).optional(),
		userId: z.string().length(24),
		recipeId: z.string().length(24),
	})
	.strict();

export type LikeInput = z.infer<typeof LikeInputSchema>;

export type ILike = LikeInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

// Unique index to avoid duplicate likes
LikeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
// For listing likes of a recipe (most recent first)
LikeSchema.index({ recipeId: 1, createdAt: -1 });
// For listing recipes liked by a user
LikeSchema.index({ userId: 1, createdAt: -1 });

export default LikeSchema;
