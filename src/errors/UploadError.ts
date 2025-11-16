import { AppError } from "./AppError";

export class UploadError extends AppError {
  constructor(message = "Error uploading file", code?: string, details?: unknown) {
    super(message, 500, code, details);
  }
}
