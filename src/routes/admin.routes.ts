import { Router } from 'express';
import { AdminController, UserController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';
import { uploadDataFile } from '../middlewares/uploadDataFile';
import { validateBody } from '../middlewares/validateBody';
import { UserInputSchema } from '../schemas';
const router = Router();

router.use(authenticate(['admin']));

router.post('/', validateBody(UserInputSchema), UserController.create);
router.post('/recipes', uploadDataFile, AdminController.importRecipes);
router.post('/ingredients', uploadDataFile, AdminController.importIngredients);
router.get('/users', AdminController.getUsers);
router.get('/:id', UserController.getById);
router.patch('/:id', UserController.update);
router.delete('/:id', UserController.delete);

export default router;
