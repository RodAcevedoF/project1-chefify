import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/', authenticate(), UserController.getById);
router.get('/email', authenticate(), UserController.getByEmail);
router.patch('/', authenticate(), UserController.update);
router.delete('/', authenticate(), UserController.delete);
router.get('/saved-recipes', authenticate(), UserController.getSavedRecipes);
router.get('/my-recipes', authenticate(), UserController.getUserRecipes);
router.post(
	'/save-recipe/:recipeId',
	authenticate(),
	UserController.saveRecipe,
);
router.delete(
	'/remove-recipe/:recipeId',
	authenticate(),
	UserController.deleteRecipe,
);
router.get(
	'/created-recipes',
	authenticate(),
	UserController.getCreatedRecipes,
);

export default router;
