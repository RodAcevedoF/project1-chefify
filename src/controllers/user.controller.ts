import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services";
import { successResponse } from "../utils";
import { BadRequestError } from "../errors"; // Asumiendo que tienes estos
import type { UserInput } from "../schemas";
import { ownership } from "../middlewares";

export const userGuard = ownership({
  findById: UserService.getUserById,
  field: "_id",
  resourceName: "user"
});

export const UserController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as UserInput;
      const created = await UserService.createUser(data);
      return successResponse(res, created, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      return successResponse(res, users);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.user?.id;
      if (!id) throw new BadRequestError("ID is required");
      const user = await UserService.getUserById(id);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  },

  async getByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        throw new BadRequestError("Email is required in query params");
      }

      const user = await UserService.getUserByEmail(email);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id || req.user?.id;
      const data = req.body as Partial<Omit<UserInput, "role">>;

      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestError("Update data is required");
      }
      if (!id) throw new BadRequestError("ID is required");

      const updated = await UserService.updateUser(id, data);
      return successResponse(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id || req.user?.id;
      if (!id) throw new BadRequestError("ID is required");

      const deleted = await UserService.deleteUser(id);
      return successResponse(res, deleted);
    } catch (error) {
      next(error);
    }
  },

  async getUserRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.user?.id;
      if (!id) throw new BadRequestError("User ID is required");
      const recipes = await UserService.getCreatedRecipes(id);
      return successResponse(res, recipes);
    } catch (error) {
      next(error);
    }
  },

  async getSavedRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.user?.id;
      if (!id) throw new BadRequestError("User ID is required");
      const user = await UserService.getSavedRecipes(id);
      return successResponse(res, user.savedRecipes);
    } catch (error) {
      next(error);
    }
  },

  async saveRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipeId } = req.params;
      const id = req.user?.id;
      if (!id || !recipeId)
        throw new BadRequestError("User ID and Recipe ID are required");

      const updated = await UserService.saveRecipe(id, recipeId);
      return successResponse(res, {
        message: "Recipe saved successfully",
        savedRecipes: updated.savedRecipes
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipeId } = req.params;
      const id = req.user?.id;
      if (!id || !recipeId)
        throw new BadRequestError("User ID and Recipe ID are required");

      const updated = await UserService.deleteRecipe(id, recipeId);
      return successResponse(res, {
        message: "Recipe removed from saved list",
        savedRecipes: updated.savedRecipes
      });
    } catch (error) {
      next(error);
    }
  }
};
