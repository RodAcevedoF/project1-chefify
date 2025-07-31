import { Schema } from "mongoose";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    foodPreference: { type: String, required: false },
    savedRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    imgUrl: { type: String, required: false },
    imgPublicId: { type: String, required: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const UserInputSchema = z
  .object({
    name: z.string().min(1, "Title is required"),
    email: z.email("Invalid email data"),
    password: z.string().min(8, "At least 8 characters"),
    foodPreference: z.string().optional(),
    savedRecipes: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    imgUrl: z.string().optional(),
    imgPublicId: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
  })
  .strict();

export type UserInput = z.infer<typeof UserInputSchema>;

userSchema.methods.populateSavedRecipes = function () {
  return this.populate("savedRecipes");
};

export type IUser = UserInput & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    next();
  } catch (err) {
    next(err as Error);
  }
});
