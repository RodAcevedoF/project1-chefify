import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", code?: string, details?: unknown) {
    super(message, 403, code, details);
  }
}
