import { AppError } from "./AppError";

export class UploadError extends AppError {
  constructor(message = "Error uploading file") {
    super(message, 500);
  }
}
