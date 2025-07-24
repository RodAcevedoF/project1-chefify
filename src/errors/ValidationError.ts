import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message = "Invalid Data") {
    super(message, 400);
  }
}
