import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { ValidationError } from "../errors";

const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        "Invalid file type. Only PNG, JPEG, JPG and WEBP are allowed."
      )
    );
  }
};

export const myMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});
