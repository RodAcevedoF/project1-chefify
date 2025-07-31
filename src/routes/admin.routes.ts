import { Router } from "express";
import { AdminController } from "../controllers";
import { authenticate } from "../middlewares/authenticate";
import { uploadDataFile } from "../middlewares/uploadDataFile";
const router = Router();

router.use(authenticate(["admin"]));

router.post("/recipes", uploadDataFile, AdminController.importRecipes);
router.post("/ingredients", uploadDataFile, AdminController.importIngredients);
router.get("/users", AdminController.getUsers);

// adminRoutes.get("/users", AdminController.getAllUsers);
// adminRoutes.delete("/users/:id", AdminController.deleteUser);
// adminRoutes.post("/feature-recipe", AdminController.featureRecipe);

export default router;
