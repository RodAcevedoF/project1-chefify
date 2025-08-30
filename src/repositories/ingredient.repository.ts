import { Ingredient } from '../models';
import type { IngredientInput, IIngredient } from '../schemas';
import { escapeRegex } from '../utils';

export const IngredientRepository = {
	async create(data: IngredientInput): Promise<void> {
		await Ingredient.create(data);
	},

	async insertMany(ingredients: IngredientInput[]): Promise<IIngredient[]> {
		await Ingredient.syncIndexes();
		return await Ingredient.insertMany(ingredients);
	},

	async findAll(): Promise<IIngredient[]> {
		return await Ingredient.find().sort({ createdAt: -1 });
	},

	async findById(id: string): Promise<IIngredient | null> {
		return await Ingredient.findById(id);
	},

	async findByName(name: string): Promise<IIngredient[]> {
		const regex = new RegExp(name, 'i');
		return await Ingredient.find({ name: regex });
	},
	async findByStrictName(name: string): Promise<IIngredient | null> {
		const escapedName = escapeRegex(name);
		const regex = new RegExp(`^${escapedName}$`, 'i');
		return await Ingredient.findOne({ name: regex });
	},
	async updateById(id: string, data: Partial<IIngredient>): Promise<void> {
		await Ingredient.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		});
	},

	async deleteById(id: string): Promise<void> {
		await Ingredient.findByIdAndDelete(id);
	},
};
