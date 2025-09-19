import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(message = "Conflict: resource already exists") {
    super(message, 409);
  }
}
