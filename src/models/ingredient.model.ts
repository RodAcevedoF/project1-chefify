import { model } from "mongoose";
import { IngredientSchema, type IIngredient } from "../schemas";

export const Ingredient = model<IIngredient>(
  "Ingredient",
  IngredientSchema,
  "ingredients"
);
