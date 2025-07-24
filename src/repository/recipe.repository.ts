import { Recipe } from "../models";
import type { IRecipe, RecipeInput } from "../schemas";
import { escapeRegex } from "../utils";

export const RecipeRepository = {
  async create(data: RecipeInput): Promise<IRecipe> {
    return await Recipe.create(data);
  },

  async insertMany(recipes: RecipeInput[]): Promise<IRecipe[]> {
    return await Recipe.insertMany(recipes);
  },

  async findAll(): Promise<IRecipe[]> {
    return await Recipe.find()
      .populate("ingredients.ingredient")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();
  },

  async findById(id: string): Promise<IRecipe | null> {
    return await Recipe.findById(id)
      .populate("ingredients.ingredient")
      .populate("userId", "name")
      .lean();
  },

  async findByTitle(title: string): Promise<IRecipe[]> {
    const regex = new RegExp(title, "i");
    return await Recipe.find({ title: regex })
      .populate("ingredients.ingredient")
      .populate("userId", "name")
      .lean();
  },
  async findByStrictTitle(title: string): Promise<IRecipe | null> {
    const escaped = escapeRegex(title);
    const regex = new RegExp(`^${escaped}$`, "i");
    return await Recipe.findOne({ title: regex });
  },

  async findByStrictTitleExcludingId(
    title: string,
    excludeId: string
  ): Promise<IRecipe | null> {
    const escaped = escapeRegex(title);
    const regex = new RegExp(`^${escaped}$`, "i");
    return await Recipe.findOne({ title: regex, _id: { $ne: excludeId } });
  },

  async findByCategory(category: string): Promise<IRecipe[]> {
    return await Recipe.find({ category })
      .populate("ingredients.ingredient")
      .lean();
  },

  async updateById(
    id: string,
    data: Partial<IRecipe>
  ): Promise<IRecipe | null> {
    return await Recipe.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })
      .populate("ingredients.ingredient")
      .populate("userId", "name")
      .lean();
  },

  async deleteById(id: string): Promise<IRecipe | null> {
    return await Recipe.findByIdAndDelete(id);
  }
};
