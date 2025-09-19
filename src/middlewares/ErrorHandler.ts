import type { Request, Response, NextFunction } from "express";
import { isAppError } from "../utils";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isKnownError = err instanceof Error;
  const statusCode =
    isKnownError && isAppError(err) ? (err.statusCode ?? 500) : 500;
  const message = isKnownError ? err.message : "Internal Server Error";
  const stack = isKnownError ? err.stack : undefined;

  const response: Record<string, unknown> = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack })
  };

  if (isKnownError && isAppError(err)) {
    response.statusCode = statusCode;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR →", err);
  }

  res.status(statusCode).json(response);
};
