import { connect, disconnect } from "mongoose";
import { Recipe, Ingredient } from "../models";
import { seedRecipes, seedIngredients } from "../data";
import { RecipeInputSchema, IngredientInputSchema } from "../schemas";
import "dotenv/config";

interface MongoError {
  code?: number;
}

export const runSeed = async () => {
  if (process.env.NODE_ENV !== "development") process.exit(1);

  try {
    const db_url = process.env.DB_URL!;
    await connect(db_url);
    console.log("Connected to MongoDB");

    await Promise.all([
      Recipe.collection.drop().catch((e) => {
        console.warn("Couldn't drop Recipe:", e.message);
      }),
      Ingredient.collection.drop().catch((e) => {
        console.warn("Couldn't drop Ingredient:", e.message);
      })
    ]);
    console.log("Dropped collections");

    await Ingredient.syncIndexes();
    await Recipe.syncIndexes();
    console.log("Indexes synchronized");

    const validIngredients = seedIngredients.filter((raw) => {
      const parsed = IngredientInputSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn("Invalid ingredient:", parsed.error);
        return false;
      }
      return true;
    });

    const insertedIngredients = [];
    const skippedIngredients = [];

    for (const ingredient of validIngredients) {
      try {
        await Ingredient.create(ingredient);
        insertedIngredients.push(ingredient.name);
      } catch (error) {
        if ((error as MongoError).code === 11000) {
          skippedIngredients.push(ingredient.name);
        } else {
          console.error("Error inserting ingredient:", error);
          process.exit(1);
        }
      }
    }

    console.log(`Inserted ${insertedIngredients.length} ingredients`);
    if (skippedIngredients.length) {
      console.log(`Skipped ${skippedIngredients.length} duplicates`);
    }

    const cleanedRecipes = seedRecipes.map((r) => ({
      ...r,
      ingredients: r.ingredients.map(({ ingredientId, quantity }) => ({
        ingredientId,
        quantity
      }))
    }));

    const insertedRecipes = [];
    const skippedRecipes = [];

    for (const recipe of cleanedRecipes) {
      const parsed = RecipeInputSchema.safeParse(recipe);
      if (!parsed.success) {
        console.warn("Invalid recipe:", parsed.error);
        continue;
      }

      try {
        await Recipe.create(recipe);
        insertedRecipes.push(recipe.title);
      } catch (error) {
        if ((error as MongoError).code === 11000) {
          skippedRecipes.push(recipe.title);
        } else {
          console.error("Error inserting recipe:", error);
          process.exit(1);
        }
      }
    }

    console.log(`Inserted ${insertedRecipes.length} recipes`);
    if (skippedRecipes.length) {
      console.log(`Skipped ${skippedRecipes.length} duplicates`);
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log("MongoDB disconnected");
  }
};

runSeed();
