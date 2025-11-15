import { Router } from 'express';
import { AdminController, UserController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';
import { uploadDataFile } from '../middlewares/uploadDataFile';
import { uploadOptionalMedia } from '../middlewares/uploadOptionalMedia';
const router = Router();

router.use(authenticate(['admin']));

router.post('/', uploadOptionalMedia(), UserController.create);
router.post('/recipes', uploadDataFile, AdminController.importRecipes);
router.post('/ingredients', uploadDataFile, AdminController.importIngredients);
router.post('/users/import', uploadDataFile, AdminController.importUsers);
router.get('/recipes/template', AdminController.getRecipesTemplate);
router.get('/operations', AdminController.getRecentOperations);
router.get('/recipes', AdminController.getRecipes);
router.get('/users/template', AdminController.getUsersTemplate);
router.get('/users', AdminController.getUsers);
router.get('/:id', UserController.getById);
router.get('/email/:email', UserController.getByEmail);
router.patch('/:id', uploadOptionalMedia(), UserController.update);
router.delete('/:id', UserController.delete);

export default router;
