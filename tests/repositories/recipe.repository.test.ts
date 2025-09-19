import { describe, it, expect, afterEach } from "bun:test";
import { RecipeRepository } from "../../src/repositories";
import { RecipeInputSchema, type RecipeInput } from "../../src/schemas";
import { setupRepoTestDB } from "../mocks/repoTestSetup";
import { dummyRecipes } from "../mocks/seedMockRecipes";

const dummy: RecipeInput = RecipeInputSchema.parse(dummyRecipes[0]);
const dummyBeta: RecipeInput = RecipeInputSchema.parse(dummyRecipes[1]);

setupRepoTestDB();

describe("RecipeRepository CRUD operations", () => {
  it("should create and retrieve a recipe", async () => {
    const created = await RecipeRepository.create(dummy);
    expect(created).toBeDefined();
    expect(created.title).toBe(dummy.title);

    const found = await RecipeRepository.findById(created._id.toString());
    expect(found?.title).toBe(dummy.title);
  });

  it("should update a user partially or fully", async () => {
    const created = await RecipeRepository.create(dummyBeta);
    if (!created) throw new Error("Data not found");
    const updated = await RecipeRepository.updateById(created._id.toString(), {
      title: "Garlic rustic cream",
    });
    expect(updated).toBeDefined();
    expect(updated!.title).toBe("Garlic rustic cream");
  });

  it("should retrieve all recipes", async () => {
    const recipes = await RecipeRepository.findAll();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThan(0);
  });

  it("should retrieve a specific recipe through a strict name", async () => {
    const recipe = await RecipeRepository.findByStrictTitle(dummy.title);
    expect(recipe?.title).toBe(dummy.title);
  });

  it("should delete a recipe", async () => {
    const created = await RecipeRepository.create(dummyBeta);
    const deleted = await RecipeRepository.deleteById(created._id.toString());
    expect(deleted).toBeTruthy();

    const shouldBeGone = await RecipeRepository.findById(
      created._id.toString()
    );
    expect(shouldBeGone).toBeNull();
  });
});
