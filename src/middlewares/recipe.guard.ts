import { RecipeService } from "../services";
import { ownership } from "./ownership";

export const recipeGuard = ownership({
  findById: () => RecipeService.getRecipeById,
  field: "userId",
  resourceName: "recipe",
});
