import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll, describe, it, expect } from "bun:test";
import { UserRepository } from "../../src/repository";
import type { UserInput } from "../../src/schemas";
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {});
});

afterEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop(); // muy importante
});

describe("UserRepository.createUser", () => {
  it("should create a valid user", async () => {
    const data: UserInput = {
      name: "Ana",
      email: "ana@example.com",
      password: "securePass123",
      role: "user"
    };
    const user = await UserRepository.createUser(data);
    expect(user).toBeDefined();
    expect(user.name).toBe("Ana");
    expect(user.email).toBe("ana@example.com");
    console.log("finish");
  });
});
