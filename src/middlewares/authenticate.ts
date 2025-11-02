import type { Response, NextFunction } from 'express';
import type { ExtendedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../errors';

export const authenticate = (allowedRoles?: string[]) => {
	return (req: ExtendedRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = (
				req.session as unknown as {
					user?: { id: string; role?: string; email?: string };
				}
			)?.user;

			if (!sessionUser) {
				throw new UnauthorizedError('Not authenticated');
			}

			const userPayload = {
				id: sessionUser.id,
				role: sessionUser.role ?? '',
				email: sessionUser.email ?? '',
			};

			req.user = userPayload as unknown as typeof req.user;

			if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
				if (!userPayload.role || !allowedRoles.includes(userPayload.role)) {
					throw new ForbiddenError('Access denied: insufficient permissions');
				}
			}

			return next();
		} catch (err) {
			next(err);
		}
	};
};
