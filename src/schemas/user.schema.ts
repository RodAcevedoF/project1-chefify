import { Schema } from 'mongoose';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { hashPasswordOnUpdate } from '@/utils/hashPasswordOnUpdate';

const aiUsageSchema = new Schema(
	{
		count: { type: Number, default: 0 },
		lastReset: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const recentOpSchema = new Schema(
	{
		type: { type: String, required: true },
		resource: { type: String, required: true },
		resourceId: { type: Schema.Types.ObjectId, required: false },
		summary: { type: String, required: false },
		meta: { type: Schema.Types.Mixed, required: false },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);
export const userSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		followersCount: { type: Number, default: 0 },
		followingCount: { type: Number, default: 0 },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		foodPreference: { type: String, required: false },
		savedRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
		imgUrl: { type: String, required: false },
		imgPublicId: { type: String, required: false },
		shortBio: { type: String, required: false, maxlength: 160 },
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		aiUsage: {
			type: aiUsageSchema,
			required: false,
			default: undefined,
		},
		recentOps: {
			type: [recentOpSchema],
			default: [],
			required: false,
		},
		emailVerificationToken: { type: String, required: false },
		emailVerificationExpires: { type: Date, required: false },
		resetPasswordToken: { type: String, required: false, null: true },
		resetPasswordExpires: { type: Date, required: false, null: true },
		isVerified: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	},
);

userSchema.virtual('recipesCount', {
	ref: 'Recipe',
	localField: '_id',
	foreignField: 'userId',
	count: true,
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

export const UserInputSchema = z
	.object({
		recentOps: z
			.array(
				z.object({
					type: z.string(),
					resource: z.string(),
					resourceId: z.string().optional(),
					summary: z.string().optional(),
					meta: z.any().optional(),
					createdAt: z
						.preprocess(
							(val) => (typeof val === 'string' ? new Date(val) : val),
							z.date(),
						)
						.optional(),
				}),
			)
			.optional(),
		name: z.string().min(1, 'Title is required'),
		followersCount: z.number().int().nonnegative().optional(),
		followingCount: z.number().int().nonnegative().optional(),
		email: z.email('Invalid email data'),
		password: z.string().min(8, 'At least 8 characters'),
		foodPreference: z.string().optional(),
		savedRecipes: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
		imgUrl: z.string().optional(),
		imgPublicId: z.string().optional(),
		role: z.enum(['user', 'admin']).default('user'),
		shortBio: z.string().max(160).optional(),
		aiUsage: z
			.object({
				count: z.number(),
				lastReset: z.preprocess(
					(val) => (typeof val === 'string' ? new Date(val) : val),
					z.date(),
				),
			})
			.optional(),
		emailVerificationToken: z.string().optional(),
		emailVerificationExpires: z.date().optional(),
		resetPasswordToken: z.string().optional().nullable(),
		resetPasswordExpires: z.date().optional().nullable(),
		isVerified: z.boolean().default(false),
	})
	.strict();

export type UserInput = z.infer<typeof UserInputSchema>;

userSchema.methods.populateSavedRecipes = function () {
	return this.populate('savedRecipes');
};

export type IUser = UserInput & {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
};

export type Operation = {
	type: string;
	resource: string;
	resourceId?: string;
	summary?: string;
	meta?: unknown;
	createdAt?: Date;
};

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const hashed = await bcrypt.hash(this.password, 10);
		this.password = hashed;
		next();
	} catch (err) {
		next(err as Error);
	}
});

userSchema.pre('findOneAndUpdate', hashPasswordOnUpdate);
userSchema.pre('updateOne', hashPasswordOnUpdate);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 'text' });
