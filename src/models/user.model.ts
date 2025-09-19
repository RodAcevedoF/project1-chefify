import { model } from "mongoose";
import { userSchema, type IUser } from "../schemas";
export const User = model<IUser>("User", userSchema, "users");
