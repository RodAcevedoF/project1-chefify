import { Router } from 'express';
import { RecipeInputSchema } from '../schemas';
import { RecipeController } from '../controllers';
import { recipeGuard } from '../middlewares/recipe.guard';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';
import { limitAIUsage } from '../middlewares/AIUsage';

const router = Router();

router.use(authenticate());

router.post('/', validateBody(RecipeInputSchema), RecipeController.create);

router.get('/', RecipeController.get);
router.get('/suggested', limitAIUsage, RecipeController.getSuggestedRecipe);
router.get('/:id', RecipeController.getById);

router.patch('/:id', recipeGuard, RecipeController.update);

router.delete('/:id', recipeGuard, RecipeController.delete);

export default router;
