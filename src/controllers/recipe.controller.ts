import type { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services';
import { successResponse } from '../utils';
import { RecipeInputSchema, type RecipeInput } from '../schemas';
import { BadRequestError, NotFoundError } from '../errors';

type RecipeBody = Omit<RecipeInput, 'userId'>;

export const RecipeController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new BadRequestError('User ID missing in request');
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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError('Invalid ID format');
      const recipe = await RecipeService.getRecipeById(id);

      if (!recipe) {
        throw new NotFoundError('Recipe not found');
      }

      return successResponse(res, recipe);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError('Invalid ID');
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
      if (!id) throw new BadRequestError('Invalid ID');
      const deleted = await RecipeService.deleteRecipe(id);
      return successResponse(res, deleted);
    } catch (error) {
      next(error);
    }
  },

  async getSuggestedRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const suggestion = await RecipeService.generateSuggestedRecipe();
      if (!suggestion) {
        throw new BadRequestError('Invalid recipe suggestion from AI');
      }
      return successResponse(res, { recipe: suggestion });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        userId,
        title,
        sort = 'desc',
        limit = 10,
        page = 1,
      } = req.query;

      const query: Record<string, unknown> = {};

      if (category) query.categories = category;
      if (userId) query.userId = userId;
      if (title) query.title = { $regex: title, $options: 'i' };

      const sortOption = sort === 'asc' ? 1 : -1;
      const limitNumber = Number(limit);
      const skipNumber = (Number(page) - 1) * limitNumber;

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
};
