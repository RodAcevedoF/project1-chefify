import type { AppErrorLike } from "../types";

export const isAppError = (err: unknown): err is AppErrorLike => {
  if (typeof err === "object" && err !== null) {
    if ("statusCode" in err) {
      const maybeStatusCode = (err as { statusCode?: unknown }).statusCode;
      return typeof maybeStatusCode === "number";
    }
  }
  return false;
};
