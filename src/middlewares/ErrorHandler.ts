import type { Request, Response } from "express";
import { isAppError } from "../utils";

export const errorHandler = (err: unknown, req: Request, res: Response) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let stack: string | undefined = undefined;

  if (err instanceof Error) {
    message = err.message;
    stack = err.stack;

    if (isAppError(err)) {
      statusCode = err.statusCode!;
    }
  }

  const response = {
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? stack : undefined
  };

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR →", err);
  }

  res.status(statusCode).json(response);
};
