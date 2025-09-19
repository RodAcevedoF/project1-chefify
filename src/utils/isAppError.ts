import type { AppError } from "../errors";

export const isAppError = (err: unknown): err is AppError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "isApp" in err &&
    (err as AppError).isApp === true
  );
};
