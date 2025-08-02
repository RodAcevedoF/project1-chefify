import { UserRepository, RecipeRepository } from "../repositories";
import type { MediaEntityType } from "./entityConfig";

export function getRepository(type: MediaEntityType) {
  switch (type) {
    case "user":
      return UserRepository;
    case "recipe":
      return RecipeRepository;
    default:
      throw new Error(`No repo found for type "${type}"`);
  }
}
