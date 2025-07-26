/* import { UserRepository } from "../repository";
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
 */

// utils/mediaEntityConfig.ts
export const mediaEntityConfig = {
  user: {
    folder: "user-profiles",
    type: "user"
  },
  recipe: {
    folder: "recipe-images",
    type: "recipe"
  }
} as const;

export type MediaEntityType = keyof typeof mediaEntityConfig;
