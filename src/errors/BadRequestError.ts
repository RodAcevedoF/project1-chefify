import { AppError } from "./AppError";

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}
