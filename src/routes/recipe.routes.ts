import { Router } from 'express';
import { RecipeController } from '../controllers';
import { recipeGuard } from '../middlewares/recipe.guard';
import { authenticate } from '../middlewares/authenticate';
import { uploadMedia } from '../middlewares/uploadMedia';
import { limitAIUsage } from '../middlewares/AIUsage';

const router = Router();

router.use(authenticate());

router.post('/', uploadMedia(), RecipeController.create);
router.get('/', RecipeController.get);
router.get('/suggested', limitAIUsage, RecipeController.getSuggestedRecipe);
router.get('/:id', RecipeController.get);

router.patch('/:id', recipeGuard, uploadMedia(), RecipeController.update);

router.delete('/:id', recipeGuard, RecipeController.delete);

export default router;
