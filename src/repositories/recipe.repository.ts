import { Recipe } from '../models';
import type { IRecipe, RecipeInput } from '../schemas';
import { escapeRegex } from '../utils';

export const RecipeRepository = {
	async create(data: RecipeInput): Promise<void> {
		await Recipe.create(data);
	},

	async insertMany(recipes: RecipeInput[]): Promise<IRecipe[]> {
		return await Recipe.insertMany(recipes);
	},

	async findById(id: string): Promise<IRecipe | null> {
		return await Recipe.findById(id)
			.populate('ingredients.ingredient')
			.populate('userId', 'name')
			.lean();
	},

	async findByStrictTitle(title: string): Promise<IRecipe | null> {
		const escaped = escapeRegex(title);
		const regex = new RegExp(`^${escaped}$`, 'i');
		return await Recipe.findOne({ title: regex })
			.populate('ingredients.ingredient')
			.populate('userId', 'name')
			.lean();
	},

	async findByStrictTitleExcludingId(
		title: string,
		excludeId: string,
	): Promise<IRecipe | null> {
		const escaped = escapeRegex(title);
		const regex = new RegExp(`^${escaped}$`, 'i');
		return await Recipe.findOne({ title: regex, _id: { $ne: excludeId } });
	},

	async updateById(id: string, data: Partial<IRecipe>): Promise<void> {
		await Recipe.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		})
			.populate('ingredients.ingredient')
			.populate('userId', 'name')
			.lean();
	},

	async deleteById(id: string): Promise<void> {
		await Recipe.findByIdAndDelete(id);
	},
};
