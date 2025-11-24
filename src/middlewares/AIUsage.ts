import type { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../errors';
import { shouldResetAIUsage } from '../utils/aiUsage';

export async function limitAIUsage(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const userId = req.user?.id;
	if (!userId) return next(new UnauthorizedError('User not authenticated'));

	const user = await User.findById(userId);
	if (!user) return next(new NotFoundError('User not found'));

	const now = new Date();

	if (!user.aiUsage) {
		user.aiUsage = {
			count: 1,
			lastReset: now,
		};
		await user.save();
		return next();
	}

	if (shouldResetAIUsage(user.aiUsage)) {
		user.aiUsage.count = 1;
		user.aiUsage.lastReset = now;
	} else {
		if (user.aiUsage.count >= 5) {
			return next(
				new ForbiddenError('You have reached the daily AI suggestion limit'),
			);
		}
		user.aiUsage.count += 1;
	}

	await user.save();
	next();
}
