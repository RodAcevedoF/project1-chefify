import { describe, it, expect } from "bun:test";
import { setupRepoTestDB } from "../mocks/repoTestSetup";
import { IngredientRepository } from "../../src/repositories";
import type { IngredientInput } from "../../src/schemas";

const dummyIngredient: IngredientInput = {
  name: "Garlic",
  unit: "cloves",
};

setupRepoTestDB();

describe("UserRepository CRUD operations", () => {
  it("should create a user", async () => {
    const ingredient = await IngredientRepository.create(dummyIngredient);
    expect(ingredient).toBeDefined();
    expect(ingredient.name).toBe(dummyIngredient.name);
  });

  it("should find a user by ID", async () => {
    const created = await IngredientRepository.create(dummyIngredient);
    if (!created._id) throw new Error("Data ID not found");

    const found = await IngredientRepository.findById(created._id.toString());

    expect(found).toBeDefined();
    expect(found!._id.toString()).toBe(created._id.toString());
  });

  it("should update a user partially or fully", async () => {
    const created = await IngredientRepository.create(dummyIngredient);
    if (!created._id) throw new Error("Data ID not found");
    const updated = await IngredientRepository.updateById(
      created._id.toString(),
      {
        name: "Black Garlic",
      }
    );

    expect(updated).toBeDefined();
    expect(updated!.name).toBe("Black Garlic");
  });

  it("should delete a user and validate it's gone", async () => {
    const created = await IngredientRepository.create(dummyIngredient);
    if (!created._id) throw new Error("Data ID not found");

    const deleted = await IngredientRepository.deleteById(
      created._id.toString()
    );
    expect(deleted).toBeDefined();
    expect(deleted!._id.toString()).toBe(created._id.toString());

    const refetch = await IngredientRepository.findById(created._id.toString());
    expect(refetch).toBeNull();
  });
});
