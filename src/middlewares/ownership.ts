import { BadRequestError, ForbiddenError, NotFoundError } from "../errors";
import type { Request, Response, NextFunction } from "express";

export const ownership = ({
  findById,
  field,
  resourceName
}: {
  findById: (id: string) => Promise<unknown>;
  field: string;
  resourceName: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Invalid ID");
      const resource = await findById(id);

      if (!resource) throw new NotFoundError(`${resourceName} not found`);

      const resourceObj = resource as Record<string, unknown>;
      const isOwner = resourceObj[field]?.toString() === req.user?.id;
      const isAdmin = req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError(
          `Not authorized to manage this ${resourceName}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
