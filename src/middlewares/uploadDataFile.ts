import { myMulter } from "../config";
import type { ExtendedRequest } from "../types";
import type { Response, NextFunction } from "express";
import { MulterError } from "multer";
import { ValidationError, UploadError } from "../errors";

export const uploadDataFile = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const uploader = myMulter.single("file");

  uploader(req, res, (err) => {
    if (err instanceof MulterError) {
      return next(new ValidationError(`Multer error: ${err.message}`));
    } else if (err) {
      return next(new UploadError(`Upload error: ${err.message}`));
    }

    if (!req.file) {
      return next(new ValidationError("No file uploaded"));
    }

    next();
  });
};
