import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';
import { uploadOptionalMedia } from '../middlewares/uploadOptionalMedia';

const router = Router();

router.get('/', authenticate(), UserController.getById);
router.get('/email', authenticate(), UserController.getByEmail);
router.patch('/', authenticate(), uploadOptionalMedia(), UserController.update);
router.delete('/', authenticate(), UserController.delete);
router.get('/saved-recipes', authenticate(), UserController.getSavedRecipes);
router.get('/my-recipes', authenticate(), UserController.getCreatedRecipes);
router.get('/ops', authenticate(), UserController.getRecentOperations);
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

export default router;
