import { beforeAll, afterEach, afterAll, describe, it, expect } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { disconnectDB, connectDB, clearDB } from "../mocks/mongoServerMock";
import { User } from "../../src/models";

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("Auth integration", () => {
  it("should login successfully with valid credentials", async () => {
    await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "hashedpassword",
    });

    const res = await request(app).post("/chefify/api/v1/auth/login").send({
      email: "user@example.com",
      password: "hashedpassword",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toBe("Login successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should logout and clear cookies", async () => {
    // Simula login para obtener cookies válidas
    await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "hashedpassword",
    });

    const loginRes = await request(app)
      .post("/chefify/api/v1/auth/login")
      .send({
        email: "user@example.com",
        password: "hashedpassword",
      });

    const cookies = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/chefify/api/v1/auth/logout")
      .set("Cookie", cookies!);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toBe("Logged out successfully");

    const setCookies = res.headers["set-cookie"];
    expect(Array.isArray(setCookies)).toBe(true);
    const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies];
    expect(cookiesArray.some((c) => c.includes("Expires="))).toBe(true);
  });

  it("should refresh tokens with valid refresh token", async () => {
    await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "hashedpassword",
    });

    const loginRes = await request(app)
      .post("/chefify/api/v1/auth/login")
      .send({
        email: "user@example.com",
        password: "hashedpassword",
      });

    const cookies = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/chefify/api/v1/auth/refresh")
      .set("Cookie", cookies!);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toBe("Access token refreshed");

    const refreshedCookies = res.headers["set-cookie"];
    expect(refreshedCookies).toBeDefined();
    expect(Array.isArray(refreshedCookies)).toBe(true);
    const cookiesArray = Array.isArray(refreshedCookies)
      ? refreshedCookies
      : [refreshedCookies];
    expect(cookiesArray!.some((c: string) => c.startsWith("accessToken"))).toBe(
      true
    );
    expect(
      cookiesArray!.some((c: string) => c.startsWith("refreshToken"))
    ).toBe(true);
  });
});
