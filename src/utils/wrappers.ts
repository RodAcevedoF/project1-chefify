import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const bcryptWrapper = {
  compare: (plain: string, hash: string) => bcrypt.compare(plain, hash),
};

export const jwtWrapper = {
  sign: (payload: object, secret: string, options?: object) =>
    jwt.sign(payload, secret, options),
};
