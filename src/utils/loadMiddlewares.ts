import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { generalRateLimiter } from "../middlewares";
import { type Express, json, urlencoded } from "express";
import cookieParser from "cookie-parser";

export const loadMiddlewares = (app: Express) => {
  // Seguridad
  app.use(helmet());
  // Logs
  app.use(morgan("dev"));
  // Control CORS (personalizable)
  app.use(
    cors({
      origin: "*", // Cambia en producción
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  // Logging en desarrollo
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
  // Parsers
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  //Rate Limiter
  app.use(generalRateLimiter);
};
