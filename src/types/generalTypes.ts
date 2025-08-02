import type { Request } from "express";

export interface ExtendedRequest extends Request {
  fileUrl?: string;
  filePublicId?: string;
}

export type JWTPayload = {
  id: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
};

export type TokenPayload = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type EmailType = "VERIFICATION" | "RESET_PASSWORD";
export interface SendEmailOptions {
  to: string;
  type: EmailType;
  payload: {
    link: string;
  };
}
