import { JWTPayload } from "../schemas";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
