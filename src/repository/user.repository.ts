import { Recipe, User } from "../models";
import type { IRecipe, IUser, UserInput } from "../schemas";

export const UserRepository = {
  async createUser(data: UserInput): Promise<IUser> {
    return await User.create(data);
  },
  /* async createUser(data: UserInput): Promise<IUser> {
    try {
      return await User.create(data);
    } catch (error) {
      throw new ValidationError(`User creation failed, ${error}`);
    } 
  },*/
  async insertMany(users: UserInput[]): Promise<UserInput[]> {
    return await User.insertMany(users);
  },

  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  },

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  },

  async updateById(
    id: string,
    data: Partial<Omit<UserInput, "role">>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  },

  async deleteById(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  },

  async addSavedRecipe(
    userId: string,
    recipeId: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedRecipes: recipeId } },
      { new: true, runValidators: true }
    );
  },

  async removeSavedRecipe(
    userId: string,
    recipeId: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { savedRecipes: recipeId } },
      { new: true }
    );
  },
  async getSavedRecipes(userId: string): Promise<IUser | null> {
    return await User.findById(userId).populate("savedRecipes");
    // .populate("savedRecipes", "-__v")
  },

  async getCreatedRecipes(userId: string): Promise<IRecipe[]> {
    return Recipe.find({ userId });
  }
};
