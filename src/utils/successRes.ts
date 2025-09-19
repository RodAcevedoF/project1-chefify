import type { Response } from "express";

export const successResponse = (
  res: Response,
  data: unknown,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};
