import { Schema } from "mongoose";
import { z } from "zod";

// 1. Mongoose Schema
export const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// 2. Zod input validation
export const RefreshTokenInputSchema = z
  .object({
    _id: z.string().length(24).optional(),
    userId: z.string().length(24),
    token: z.string().min(10),
    expiresAt: z.coerce.date()
  })
  .strict();

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

// 3. Full type with timestamps
export type IRefreshToken = RefreshTokenInput & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
