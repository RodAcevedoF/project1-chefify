import { IngredientService } from "../services";
import { ownership } from "./ownership";

export const ingredientGuard = ownership({
  findById: () => IngredientService.getIngredientById,
  field: "createdBy",
  resourceName: "ingredient",
});
