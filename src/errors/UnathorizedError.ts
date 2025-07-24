import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message = "Missing or invalid credentials") {
    super(message, 403);
  }
}
