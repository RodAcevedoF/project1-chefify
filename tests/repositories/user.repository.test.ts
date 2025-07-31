import { describe, it, expect, beforeEach } from "bun:test";
import { UserRepository } from "../../src/repositories";
import type { UserInput } from "../../src/schemas";
import { setupRepoTestDB } from "../mocks/repoTestSetup";
import { clearDB } from "../mocks/mongoServerMock";

const dummyUser: UserInput = {
  name: "Rodrigo",
  email: "rodrigo@example.com",
  password: "securepassword",
  role: "user",
};

setupRepoTestDB();

beforeEach(async () => {
  await clearDB();
});

describe("UserRepository CRUD operations", () => {
  it("should create a user", async () => {
    const user = await UserRepository.createUser(dummyUser);
    expect(user).toBeDefined();
    expect(user.email).toBe(dummyUser.email);
  });

  it("should find a user by ID", async () => {
    const created = await UserRepository.createUser(dummyUser);
    const found = await UserRepository.findById(created._id.toString());

    expect(found).toBeDefined();
    expect(found!.email).toBe(dummyUser.email);
  });

  it("should update a user partially or fully", async () => {
    const created = await UserRepository.createUser(dummyUser);
    const updated = await UserRepository.updateById(created._id.toString(), {
      name: "Roderick Modified",
    });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe("Roderick Modified");
  });

  it("should delete a user and validate it's gone", async () => {
    const created = await UserRepository.createUser(dummyUser);
    const deleted = await UserRepository.deleteById(created._id.toString());

    expect(deleted).toBeDefined();
    expect(deleted!.email).toBeNull;

    const refetch = await UserRepository.findById(created._id.toString());
    expect(refetch).toBeNull();
  });
});
