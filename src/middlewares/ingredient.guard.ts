import { IngredientService } from '../services';
import { ownership } from './ownership';

export const ingredientGuard = ownership({
	findById: () => async (id: string) => {
		const result = IngredientService.getIngredients({ id });
		return Array.isArray(result) ? result[0] : result;
	},
	field: 'createdBy',
	resourceName: 'ingredient',
});
