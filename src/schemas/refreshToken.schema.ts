import { Schema } from 'mongoose';
import { z } from 'zod';

export const RefreshTokenSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		token: { type: String, required: true, unique: true },
		expiresAt: { type: Date, required: true },
	},
	{ timestamps: true },
);

export const RefreshTokenInputSchema = z
	.object({
		_id: z.string().length(24).optional(),
		userId: z.string().length(24),
		token: z.string().min(10),
		expiresAt: z.coerce.date(),
	})
	.strict();

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

export type IRefreshToken = RefreshTokenInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ createdAt: -1 });
