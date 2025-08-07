import type { HydratedDocument } from "mongoose";
import type { IUser } from "../schemas";

export function sanitizeUser(user: HydratedDocument<IUser> | IUser) {
  const userAsObject =
    typeof (user as HydratedDocument<IUser>).toObject === "function"
      ? (user as HydratedDocument<IUser>).toObject()
      : user;
  const { password, ...userWithoutPassword } = userAsObject;
  return userWithoutPassword;
}
