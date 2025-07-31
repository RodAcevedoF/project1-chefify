import { Router } from "express";
import { UserController } from "../controllers";
import { UserInputSchema } from "../schemas";
import { userGuard } from "../middlewares/user.guard";
import { authenticate } from "../middlewares/authenticate";
import { validateBody } from "../middlewares/validateBody";

const router = Router();

// Crear usuario
router.post("/", validateBody(UserInputSchema), UserController.create);

// Obtener usuario por ID
router.get("/", authenticate(), UserController.getById);
router.get("/:id", authenticate(["admin"]), userGuard, UserController.getById);

// Obtener usuario por email (usando query param: ?email=...)
router.get("/search/email", authenticate(), UserController.getByEmail);

// Actualizar usuario
router.patch("/", authenticate(), UserController.update);
router.patch("/:id", authenticate(["admin"]), userGuard, UserController.update);

// Eliminar usuario
router.delete("/", authenticate(), UserController.delete);
router.delete(
  "/:id",
  authenticate(["admin"]),
  userGuard,
  UserController.delete
);

router.get("/saved-recipes", authenticate(), UserController.getSavedRecipes);

router.get("/my-recipes", authenticate(), UserController.getUserRecipes);

export default router;
