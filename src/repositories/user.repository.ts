import type { HydratedDocument, PipelineStage } from 'mongoose';
import { Recipe, User } from '../models';
import type { IRecipe, IUser, UserInput, Operation } from '../schemas';

export const UserRepository = {
	async createUser(data: UserInput): Promise<void> {
		await User.create(data);
	},

	async findPaginatedWithRecipeCount(opts?: {
		page?: number;
		limit?: number;
		sort?: number; // 1 or -1
		search?: string;
	}): Promise<{ items: (IUser & { recipesCount?: number })[]; total: number }> {
		const page = Math.max(1, opts?.page ?? 1);
		const limit = Math.max(0, opts?.limit ?? 0);
		const sort = opts?.sort === 1 ? 1 : -1;
		const search = opts?.search?.trim();

		const match: Record<string, unknown> = {};
		if (search) {
			match['$or'] = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			];
		}

		const pipeline: PipelineStage[] = [
			{ $match: match } as unknown as PipelineStage,
			{ $sort: { createdAt: sort } } as unknown as PipelineStage,
			{
				$lookup: {
					from: 'recipes',
					localField: '_id',
					foreignField: 'userId',
					as: 'recipesArr',
				},
			} as unknown as PipelineStage,
			{
				$addFields: {
					recipesCount: { $size: { $ifNull: ['$recipesArr', []] } },
				},
			} as unknown as PipelineStage,
			{ $project: { recipesArr: 0 } } as unknown as PipelineStage,
		];

		if (limit > 0) {
			const skip = (page - 1) * limit;
			pipeline.push({ $skip: skip } as unknown as PipelineStage);
			pipeline.push({ $limit: limit } as unknown as PipelineStage);
		}

		const items = (await User.aggregate(pipeline)) as (IUser & {
			recipesCount?: number;
		})[];
		const total = await User.countDocuments(match);
		return { items, total };
	},

	async insertMany(users: UserInput[]): Promise<UserInput[]> {
		return await User.insertMany(users);
	},

	async findAll(): Promise<IUser[]> {
		return await User.find().sort({ createdAt: -1 });
	},

	async findAllWithRecipeCount(): Promise<
		(IUser & { recipesCount?: number })[]
	> {
		const pipeline: PipelineStage[] = [
			{ $sort: { createdAt: -1 } } as unknown as PipelineStage,
			{
				$lookup: {
					from: 'recipes',
					localField: '_id',
					foreignField: 'userId',
					as: 'recipesArr',
				},
			} as unknown as PipelineStage,
			{
				$addFields: {
					recipesCount: { $size: { $ifNull: ['$recipesArr', []] } },
				},
			} as unknown as PipelineStage,
			{ $project: { recipesArr: 0 } } as unknown as PipelineStage,
		];

		return (await User.aggregate(pipeline)) as (IUser & {
			recipesCount?: number;
		})[];
	},

	async findById(id: string): Promise<HydratedDocument<IUser> | null> {
		return await User.findById(id);
	},

	async findByEmail(email: string): Promise<HydratedDocument<IUser> | null> {
		return await User.findOne({ email });
	},

	async updateById(
		id: string,
		data: Partial<Omit<UserInput, 'role'>>,
	): Promise<void> {
		await User.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		});
	},

	async deleteById(id: string): Promise<void> {
		await User.findByIdAndDelete(id);
	},

	async addSavedRecipe(userId: string, recipeId: string): Promise<void> {
		await User.findByIdAndUpdate(
			userId,
			{ $addToSet: { savedRecipes: recipeId } },
			{ new: true, runValidators: true },
		);
	},

	async removeSavedRecipe(userId: string, recipeId: string): Promise<void> {
		await User.findByIdAndUpdate(
			userId,
			{ $pull: { savedRecipes: recipeId } },
			{ new: true },
		);
	},

	async getSavedRecipes(userId: string): Promise<IUser | null> {
		return await User.findById(userId).populate('savedRecipes');
	},

	async getCreatedRecipes(userId: string): Promise<IRecipe[]> {
		return Recipe.find({ userId });
	},

	async incFollowersCount(userId: string, delta = 1): Promise<void> {
		await User.findByIdAndUpdate(userId, { $inc: { followersCount: delta } });
	},

	async incFollowingCount(userId: string, delta = 1): Promise<void> {
		await User.findByIdAndUpdate(userId, { $inc: { followingCount: delta } });
	},

	async addOperation(userId: string, op: Operation): Promise<void> {
		await User.findByIdAndUpdate(
			userId,
			{
				$push: {
					recentOps: { $each: [op], $position: 0, $slice: 5 },
				},
			},
			{ new: true, runValidators: true },
		);
	},

	async getRecentOperations(userId: string): Promise<Operation[] | null> {
		const user = await User.findById(userId).select('recentOps');
		return user ? (user.recentOps as Operation[]) : null;
	},
	async findByEmailToken(
		emailVerificationToken: string,
	): Promise<HydratedDocument<IUser> | null> {
		return await User.findOne({
			emailVerificationToken,
			emailVerificationExpires: { $gt: new Date() },
		});
	},

	async findByEmailTokenIgnoreExpiry(
		emailVerificationToken: string,
	): Promise<HydratedDocument<IUser> | null> {
		return await User.findOne({ emailVerificationToken });
	},

	async findByResetToken(
		resetPasswordToken: string,
	): Promise<HydratedDocument<IUser> | null> {
		return await User.findOne({
			resetPasswordToken,
			resetPasswordExpires: { $gt: new Date() },
		});
	},

	async findOperations(): Promise<Operation[]> {
		const pipeline: PipelineStage[] = [
			{ $project: { recentOps: 1 } } as unknown as PipelineStage,
			{ $unwind: '$recentOps' } as unknown as PipelineStage,
			{ $replaceRoot: { newRoot: '$recentOps' } } as unknown as PipelineStage,
			{ $sort: { createdAt: -1 } } as unknown as PipelineStage,
		];

		const ops = (await User.aggregate(pipeline)) as Operation[];
		return ops;
	},
};
