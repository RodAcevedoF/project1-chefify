import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate(), AuthController.logout);
router.post('/logout-all', authenticate(), AuthController.logoutAll);
// The route already uses POST, no changes needed.
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', authenticate(), AuthController.changePassword);
router.post(
	'/logout-all/:id',
	authenticate(['admin']),
	authGuard,
	AuthController.logoutAll,
);
router.get('/verify-email', AuthController.verifyEmail);
router.get('/me', authenticate(), AuthController.status);

export default router;
