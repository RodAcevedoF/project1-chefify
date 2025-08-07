import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate(), AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout-all', authenticate(), AuthController.logoutAll);
router.get('/verify-email', AuthController.verifyEmail);
router.get('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
// Ruta para comprobar si el usuario está logueado y verificado
router.get('/status', authenticate(), AuthController.status);

router.post(
  '/logout-all/:id',
  authenticate(['admin']),
  authGuard,
  AuthController.logoutAll
);

export default router;
