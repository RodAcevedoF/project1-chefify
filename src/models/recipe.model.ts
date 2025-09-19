import { model } from "mongoose";
import { recipeSchema, type IRecipe } from "../schemas";

export const Recipe = model<IRecipe>("Recipe", recipeSchema, "recipes");
