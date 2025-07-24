import { Router } from "express";
import { AdminController } from "../controllers";
import { authenticate, uploadDataFile } from "../middlewares";
const router = Router();

// Protección: requiere login + rol 'admin'
router.use(authenticate(["admin"]));
// Importar recetas desde archivo CSV o Excel
router.post("/recipes", uploadDataFile, AdminController.importRecipes);
router.post("/ingredients", uploadDataFile, AdminController.importIngredients);
router.get("/users", AdminController.getUsers);

// Otros endpoints de administración
// adminRoutes.get("/users", AdminController.getAllUsers);
// adminRoutes.delete("/users/:id", AdminController.deleteUser);
// adminRoutes.post("/feature-recipe", AdminController.featureRecipe);
// etc.

export default router;
