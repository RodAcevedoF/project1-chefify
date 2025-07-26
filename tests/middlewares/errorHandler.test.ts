import express from "express";
import request from "supertest";
import { describe, it, expect } from "bun:test";
import { errorHandler } from "../../src/middlewares";
import { AppError, BadRequestError } from "../../src/errors";

describe("Middleware errorHandler", () => {
  const app = express();
  app.use(express.json());

  app.get("/mock-error", (_req, _res, next) => {
    next(new AppError("Failed experiment", 503));
  });

  app.get("/mock-specific-error", (_req, _res, next) => {
    next(new BadRequestError("Invalid parameter"));
  });

  app.get("/generic-error", (_req, _res, next) => {
    next(new Error("Internal server error"));
  });

  app.use(errorHandler);

  it("should handle AppError and include statusCode in body", async () => {
    const res = await request(app).get("/mock-error");
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      success: false,
      error: "Failed experiment",
      statusCode: 503
    });
  });

  it("should handle BadRequestError and include statusCode in body", async () => {
    const res = await request(app).get("/mock-specific-error");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: "Invalid parameter",
      statusCode: 400
    });
  });

  it("should handle generic Error without statusCode", async () => {
    const res = await request(app).get("/generic-error");
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      success: false,
      error: "Internal server error"
      // statusCode omitted by rule
    });
  });
});
