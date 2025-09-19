import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors";

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return next(new ValidationError(`Invalid request body: ${message}`));
    }

    req.body = result.data;
    next();
  };
