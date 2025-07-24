import { UserRepository } from "../repository";
import { RecipeRepository } from "../repository";

export const mediaEntityConfig = {
  user: {
    folder: "user-profiles",
    repo: UserRepository
  },
  recipe: {
    folder: "recipe-images",
    repo: RecipeRepository
  }
} as const;

export type MediaEntityType = keyof typeof mediaEntityConfig;
