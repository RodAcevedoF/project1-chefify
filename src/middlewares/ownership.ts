import { getOwnerId } from '@/utils/ownership-helper';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import type { Request, Response, NextFunction } from 'express';

type FindByIdFn = () => (id: string) => Promise<unknown>;

export const ownership = ({
	findById,
	field,
	resourceName,
}: {
	findById: FindByIdFn;
	field: string;
	resourceName: string;
}) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			if (!id) throw new BadRequestError('Invalid ID');

			const resolver = findById();
			const resource = await resolver(id);
			if (!resource) throw new NotFoundError(`${resourceName} not found`);

			const rawOwner = (resource as Record<string, unknown>)[field];
			const ownerId = getOwnerId(rawOwner);

			const tokenUserId = req.user?.id ? String(req.user.id) : null;
			const isOwner = Boolean(
				ownerId && tokenUserId && ownerId === tokenUserId,
			);
			const isAdmin = req.user?.role === 'admin';

			if (!isOwner && !isAdmin) {
				throw new ForbiddenError(
					`Not authorized to manage this ${resourceName}`,
				);
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
