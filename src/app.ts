import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares";
import { loadCheckers, loadMiddlewares, loadRoutes } from "./utils";

dotenv.config();

const app = express();

// Middleware como express.json(), cors, etc.
loadMiddlewares(app);

// 💡 Rutas públicas primero
loadCheckers(app);

// Rutas principales
loadRoutes(app);

// 🧱 Middleware de 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// 🛡️ Middleware de manejo de errores
app.use(errorHandler);

export default app;
