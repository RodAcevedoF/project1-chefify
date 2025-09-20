import { RecipeRepository } from '../repositories';
import { ownership } from './ownership';

export const recipeGuard = ownership({
	findById: () => RecipeRepository.findById,
	field: 'userId',
	resourceName: 'recipe',
});
