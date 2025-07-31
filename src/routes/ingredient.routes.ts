import { Router } from "express";
import { IngredientController } from "../controllers";
import { IngredientInputSchema } from "../schemas";
import { ingredientGuard } from "../middlewares/ingredient.guard";
import { authenticate } from "../middlewares/authenticate";
import { validateBody } from "../middlewares/validateBody";

const router = Router();
router.use(authenticate());
// Crear ingrediente
router.post(
  "/",
  validateBody(IngredientInputSchema),
  IngredientController.create
);

// Obtener todos los ingredientes
router.get("/", IngredientController.getAll);

// Obtener ingrediente por ID
router.get("/search", IngredientController.getByName);
router.get("/:id", IngredientController.getById);

// Actualizar ingrediente
router.patch("/:id", ingredientGuard, IngredientController.update);

// Eliminar ingrediente
router.delete("/:id", ingredientGuard, IngredientController.delete);

export default router;
