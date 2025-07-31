import { Router } from "express";
import { RecipeInputSchema } from "../schemas";
import { RecipeController } from "../controllers";
import { recipeGuard } from "../middlewares/recipe.guard";
import { authenticate } from "../middlewares/authenticate";
import { validateBody } from "../middlewares/validateBody";
const router = Router();

// Autenticación para todas las rutas de recetas
router.use(authenticate());

// Crear receta
router.post("/", validateBody(RecipeInputSchema), RecipeController.create);

// Obtener todas las recetas
router.get("/", RecipeController.getAll);

// Obtener una receta por ID
router.get("/category", RecipeController.getByCategory);
router.get("/search", RecipeController.getByTitle); // ?title=Paella
router.get("/:id", RecipeController.getById);
//Obtener sugerencia de receta (IA generated)

// Actualizar receta
router.patch("/:id", recipeGuard, RecipeController.update);

// Eliminar receta
router.delete("/:id", recipeGuard, RecipeController.delete);

export default router;
