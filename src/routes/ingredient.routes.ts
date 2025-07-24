import { Router } from "express";
import { IngredientController, ingredientGuard } from "../controllers";
import { authenticate, validateBody } from "../middlewares";
import { IngredientInputSchema } from "../schemas";

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
