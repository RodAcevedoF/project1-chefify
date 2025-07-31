import { Schema } from "mongoose";
import { z } from "zod";
import bcrypt from "bcryptjs";

/* export const userSchema = new Schema(
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
    iaUsage: {
      count: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
      required: false,
    },
  },
  {
    timestamps: true,
  }
); */

const iaUsageSchema = new Schema(
  {
    count: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now },
  },
  { _id: false } // evita que mongoose cree un _id para el subdocumento
);

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
    iaUsage: {
      type: iaUsageSchema,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

/* export const UserInputSchema = z
  .object({
    name: z.string().min(1, "Title is required"),
    email: z.email("Invalid email data"),
    password: z.string().min(8, "At least 8 characters"),
    foodPreference: z.string().optional(),
    savedRecipes: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    imgUrl: z.string().optional(),
    imgPublicId: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
    iaUsage: z
      .object({
        count: z.number(),
        lastReset: z.preprocess(
          (val) => (typeof val === "string" ? new Date(val) : val),
          z.date()
        ),
      })
      .optional(),
  })
  .strict(); */

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
    iaUsage: z
      .object({
        count: z.number(),
        lastReset: z.preprocess(
          (val) => (typeof val === "string" ? new Date(val) : val),
          z.date()
        ),
      })
      .optional(),
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
