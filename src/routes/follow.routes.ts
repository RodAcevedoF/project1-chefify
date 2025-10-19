import { Router } from 'express';
import { FollowController } from '../controllers';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/:userId/follow', authenticate(), FollowController.follow);
router.delete('/:userId/unfollow', authenticate(), FollowController.unfollow);
router.get('/:userId/followers', FollowController.getFollowers);
router.get('/:userId/following', FollowController.getFollowing);
router.get(
	'/:userId/is-following',
	authenticate(),
	FollowController.isFollowing,
);

export default router;
