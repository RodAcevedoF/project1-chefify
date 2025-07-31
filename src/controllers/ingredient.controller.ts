import type { Request, Response, NextFunction } from "express";
import { IngredientService } from "../services";
import { successResponse } from "../utils";
import type { IngredientInput } from "../schemas";
import { BadRequestError, NotFoundError } from "../errors";

export const IngredientController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as IngredientInput;
      const newIngredient: IngredientInput = {
        name: body.name,
        unit: body.unit,
        userId: req.user?.id,
      };
      const created = await IngredientService.createIngredient(newIngredient);
      return successResponse(res, created, 201);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await IngredientService.getAllIngredients();
      return successResponse(res, recipes);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID format");
      const ingredient = await IngredientService.getIngredientById(id);

      if (!ingredient) {
        throw new NotFoundError("Ingredient not found");
      }

      return successResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  },
  async getByName(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.query;
      if (typeof name !== "string" || name.trim().length < 1) {
        throw new BadRequestError("Missing or invalid ingredient name");
      }

      const results = await IngredientService.getIngredienteByName(name);
      if (!results.length)
        throw new NotFoundError(`No ingredients found for "${name}"`);

      return successResponse(res, results, 200);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID");
      const updated = await IngredientService.updateIngredient(id, req.body);
      return successResponse(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID");
      const deleted = await IngredientService.deleteIngredient(id);
      return successResponse(res, deleted);
    } catch (error) {
      next(error);
    }
  },
};
