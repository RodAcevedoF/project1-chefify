import type { Request, Response, NextFunction } from "express";
import { RecipeService } from "../services";
import { successResponse } from "../utils";
import { RecipeInputSchema, type RecipeInput } from "../schemas";
import { BadRequestError, NotFoundError } from "../errors";

type RecipeBody = Omit<RecipeInput, "userId">;

export const RecipeController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new BadRequestError("User ID missing in request");
      }

      const body: RecipeBody = RecipeInputSchema.parse(req.body);

      const newRecipe: RecipeInput = {
        ...body,
        userId: req.user.id,
      };

      const created = await RecipeService.createRecipe(newRecipe);
      return successResponse(res, created, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await RecipeService.getAllRecipes();
      return successResponse(res, recipes);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID format");
      const recipe = await RecipeService.getRecipeById(id);

      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      return successResponse(res, recipe);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID");
      const updateData = req.body;
      const updated = await RecipeService.updateRecipe(id, updateData);
      return successResponse(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID");
      const deleted = await RecipeService.deleteRecipe(id);
      return successResponse(res, deleted);
    } catch (error) {
      next(error);
    }
  },

  async getFiltered(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, userId, title, sort = "desc", limit, skip } = req.query;

      const query: Record<string, unknown> = {};

      if (category) query.categories = category;
      if (userId) query.userId = userId;
      if (title) query.title = { $regex: title, $options: "i" };

      const sortOption = sort === "asc" ? 1 : -1;
      const limitNumber = limit ? Number(limit) : 10;
      const skipNumber = skip ? Number(skip) : 0;

      const recipes = await RecipeService.getFilteredRecipes(
        query,
        sortOption,
        limitNumber,
        skipNumber
      );

      return successResponse(res, recipes);
    } catch (error) {
      next(error);
    }
  },
  async getByTitle(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.query;
      if (typeof title !== "string" || title.trim().length < 1) {
        throw new BadRequestError("Missing or invalid recipe title");
      }

      const results = await RecipeService.getRecipesByTitle(title);
      if (!results.length)
        throw new NotFoundError(`No recipes found for "${title}"`);

      return successResponse(res, results, 200);
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      if (typeof category !== "string" || category.trim().length < 1) {
        throw new BadRequestError("Missing or invalid recipe category");
      }

      const results = await RecipeService.getRecipesByCategory(category);
      if (!results.length)
        throw new NotFoundError(`No recipes found for category "${category}"`);

      return successResponse(res, results, 200);
    } catch (error) {
      next(error);
    }
  },
};
