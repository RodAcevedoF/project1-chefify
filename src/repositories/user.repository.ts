import type { HydratedDocument } from "mongoose";
import { Recipe, User } from "../models";
import type { IRecipe, IUser, UserInput } from "../schemas";

export const UserRepository = {
  async createUser(data: UserInput): Promise<HydratedDocument<IUser>> {
    return await User.create(data);
  },
  async insertMany(users: UserInput[]): Promise<UserInput[]> {
    return await User.insertMany(users);
  },

  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  },

  async findById(id: string): Promise<HydratedDocument<IUser> | null> {
    return await User.findById(id);
  },

  async findByEmail(email: string): Promise<HydratedDocument<IUser> | null> {
    return await User.findOne({ email });
  },

  async findByEmailToken(
    emailVerificationToken: string
  ): Promise<HydratedDocument<IUser> | null> {
    return await User.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: new Date() },
    });
  },

  async findByResetToken(
    resetPasswordToken: string
  ): Promise<HydratedDocument<IUser> | null> {
    return await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: new Date() },
    });
  },

  async updateById(
    id: string,
    data: Partial<Omit<UserInput, "role">>
  ): Promise<HydratedDocument<IUser> | null> {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
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
  },

  async getCreatedRecipes(userId: string): Promise<IRecipe[]> {
    return Recipe.find({ userId });
  },
};
