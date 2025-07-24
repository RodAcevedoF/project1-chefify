import type { Express } from "express";

export const loadCheckers = (app: Express) => {
  app.get("/ping", (req, res) => {
    res.json({ message: "Server is running!" });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime()
    });
  });
};
