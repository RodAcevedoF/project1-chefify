import { AppError } from "./AppError";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code?: string, details?: unknown) {
    super(message, 400, code, details);
  }
}
