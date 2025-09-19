import { Router } from 'express';
import { IngredientController } from '../controllers';
import { IngredientInputSchema } from '../schemas';
import { ingredientGuard } from '../middlewares/ingredient.guard';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';

const router = Router();
router.use(authenticate());

router.post(
	'/',
	validateBody(IngredientInputSchema),
	IngredientController.create,
);
router.get('/', IngredientController.get);
router.get('/:id', IngredientController.get);
router.patch('/:id', ingredientGuard, IngredientController.update);
router.delete('/:id', ingredientGuard, IngredientController.delete);

export default router;
