import { model } from "mongoose";
import { RefreshTokenSchema, type IRefreshToken } from "../schemas";

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
  "refresh_tokens"
);
