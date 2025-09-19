import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import "dotenv/config";

describe("GET /chefify/api/v1/ping", () => {
  it("must response with status 200 and pong message", async () => {
    const res = await request(app).get("/chefify/api/v1/ping");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Server is running!");
  });
});
