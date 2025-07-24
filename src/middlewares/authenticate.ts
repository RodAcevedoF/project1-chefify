import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayloadSchema } from "../schemas";
import { UnauthorizedError, ForbiddenError, ValidationError } from "../errors";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME;

export const authenticate = (allowedRoles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Intenta obtener el token desde cookie
      if (!COOKIE_NAME) {
        throw new ValidationError(
          "COOKIE_NAME environment variable is not defined"
        );
      }
      const tokenFromCookie = req.cookies?.[COOKIE_NAME];

      // 2. Si no hay cookie, intenta desde Authorization header
      const authHeader = req.headers.authorization;
      const tokenFromHeader =
        authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1];

      const token = tokenFromCookie || tokenFromHeader;

      if (!token) throw new UnauthorizedError("No token provided");

      const rawPayload = jwt.verify(token, JWT_SECRET);
      const payload = JWTPayloadSchema.parse(rawPayload);

      req.user = payload;

      // Si se pasan roles permitidos, validarlos
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!payload.role || !allowedRoles.includes(payload.role)) {
          throw new ForbiddenError("Access denied: insufficient permissions");
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
