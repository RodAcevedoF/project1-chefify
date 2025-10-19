import { Schema } from 'mongoose';
import { z } from 'zod';

export const FollowSchema = new Schema(
	{
		follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true },
);

export const FollowInputSchema = z
	.object({
		_id: z.string().length(24).optional(),
		follower: z.string().length(24),
		following: z.string().length(24),
	})
	.strict();

export type FollowInput = z.infer<typeof FollowInputSchema>;

export type IFollow = FollowInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1, createdAt: -1 });
FollowSchema.index({ follower: 1, createdAt: -1 });

export default FollowSchema;
