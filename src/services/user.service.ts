import { UserRepository } from "../repository";
import type { UserInput, IUser, IRecipe } from "../schemas";
import { BadRequestError, NotFoundError } from "../errors";
import bcrypt from "bcryptjs";
import { MediaService } from "./media.service";

export const UserService = {
  async createUser(data: UserInput): Promise<IUser> {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new BadRequestError("Email already exists");
    const hashedPass = await bcrypt.hash(data.password, 10);
    return await UserRepository.createUser({ ...data, password: hashedPass });
  },

  async getAllUsers(): Promise<IUser[]> {
    return await UserRepository.findAll();
  },

  async getUserById(id: string): Promise<IUser> {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new NotFoundError(`No user with email ${email}`);
    return user;
  },

  async updateUser(
    id: string,
    data: Partial<Omit<UserInput, "role">>
  ): Promise<IUser> {
    // Protección extra: eliminar cualquier intento de cambiar el rol
    if ("role" in data) delete (data as Partial<UserInput>).role;
    const updated = await UserRepository.updateById(id, data);
    if (!updated) throw new NotFoundError("User not found for update");
    return updated;
  },

  async deleteUser(id: string): Promise<IUser> {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError("User not found for deletion");

    await MediaService.deleteEntityImage(id, "user");

    const deleted = await UserRepository.deleteById(id);
    if (!deleted) throw new NotFoundError("User not found for deletion");

    return deleted;
  },

  async saveRecipe(userId: string, recipeId: string): Promise<IUser> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const alreadySaved = user.savedRecipes?.includes(recipeId);
    if (alreadySaved) {
      throw new BadRequestError("Recipe already saved");
    }

    const updated = await UserRepository.addSavedRecipe(userId, recipeId);
    if (!updated) throw new BadRequestError("Could not save recipe");
    return updated;
  },

  async deleteRecipe(userId: string, recipeId: string): Promise<IUser> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const updated = await UserRepository.removeSavedRecipe(userId, recipeId);
    if (!updated) throw new BadRequestError("Could not remove saved recipe");
    return updated;
  },

  async getSavedRecipes(userId: string): Promise<IUser> {
    const user = await UserRepository.getSavedRecipes(userId);
    if (!user) throw new NotFoundError("Recipes not found");
    return user;
  },

  async getCreatedRecipes(userId: string): Promise<IRecipe[]> {
    const recipes = await UserRepository.getCreatedRecipes(userId);
    if (!recipes) throw new NotFoundError("Recipes not found");
    return recipes;
  }
};
