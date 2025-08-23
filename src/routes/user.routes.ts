import { Router } from 'express';
import { UserController } from '../controllers';
import { UserInputSchema } from '../schemas';
import { userGuard } from '../middlewares/user.guard';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validateBody';

const router = Router();

router.post(
	'/',
	authenticate(['admin']),
	validateBody(UserInputSchema),
	UserController.create,
);

router.get('/', authenticate(), UserController.getById);
router.get('/email', authenticate(), UserController.getByEmail);
router.get('/:id', authenticate(['admin']), userGuard, UserController.getById);

router.patch('/', authenticate(), UserController.update);
router.patch('/:id', authenticate(['admin']), userGuard, UserController.update);

router.delete('/', authenticate(), UserController.delete);
router.delete(
	'/:id',
	authenticate(['admin']),
	userGuard,
	UserController.delete,
);

router.get('/saved-recipes', authenticate(), UserController.getSavedRecipes);

router.get('/my-recipes', authenticate(), UserController.getUserRecipes);

export default router;
