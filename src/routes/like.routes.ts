import { Router } from 'express';
import { LikeController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/:recipeId/like', authenticate(), LikeController.like);
router.delete('/:recipeId/unlike', authenticate(), LikeController.unlike);
router.get('/:recipeId/has-liked', authenticate(), LikeController.hasLiked);

export default router;
