import { Router } from "express";
import { AuthController, authGuard } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.post("/login", AuthController.login);
router.post("/logout", authenticate(), AuthController.logout);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout-all", authenticate(), AuthController.logoutAll);
router.post(
  "/logout-all/:id",
  authenticate(["admin"]),
  authGuard,
  AuthController.logoutAll
);

export default router;
