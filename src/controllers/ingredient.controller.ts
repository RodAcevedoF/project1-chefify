import type { Request, Response, NextFunction } from 'express';
import { IngredientService } from '../services';
import { successResponse } from '../utils';
import type { IngredientInput } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';

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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError('Invalid ID format');
      const ingredient = await IngredientService.getIngredientById(id);

      if (!ingredient) {
        throw new NotFoundError('Ingredient not found');
      }

      return successResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError('Invalid ID');
      const updated = await IngredientService.updateIngredient(id, req.body);
      return successResponse(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError('Invalid ID');
      const deleted = await IngredientService.deleteIngredient(id);
      return successResponse(res, deleted);
    } catch (error) {
      next(error);
    }
  },
  async getFiltered(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, name, sort = 'desc', limit = 10, page = 1 } = req.query;

      const query: Record<string, unknown> = {};
      if (userId) query.userId = userId;
      if (name) query.name = { $regex: name, $options: 'i' };

      const sortOption = sort === 'asc' ? 1 : -1;
      const limitNumber = Number(limit);
      const skipNumber = (Number(page) - 1) * limitNumber;

      const ingredients = await IngredientService.getFilteredIngredients(
        query,
        sortOption,
        limitNumber,
        skipNumber
      );

      return successResponse(res, ingredients);
    } catch (error) {
      next(error);
    }
  },
};
