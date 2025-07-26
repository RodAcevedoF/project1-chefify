import type { Express } from "express";

export const loadCheckers = (app: Express) => {
  app.get("/chefify/api/v1/ping", (req, res) => {
    res.json({ message: "Server is running!" });
  });

  app.get("/chefify/api/v1/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime()
    });
  });
};
