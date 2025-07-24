import "dotenv/config";

const COOKIE_NAME = process.env.COOKIE_NAME;
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 1000 * 60 * 60
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7
};

export {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS
};
