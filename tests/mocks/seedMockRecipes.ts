import type { RecipeInput } from "../../src/schemas";

export const dummyRecipes = [
  {
    title: "Garlic Soup",
    userId: "65c123456789456123456784",
    categories: ["Soups"],
    ingredients: [
      {
        ingredient: "64b111111111111111111124",
        quantity: 3,
      },
    ],
    instructions: [
      "Chop garlic",
      "Fry in abundant oil",
      "Prepare broth",
      "Cook for 1 hour",
    ],
    servings: 2,
    prepTime: 70,
    utensils: ["Pan", "Pot"],
  },
  {
    title: "Creamy garlic",
    userId: "65c123456789456123456785",
    categories: ["Creams"],
    ingredients: [
      {
        ingredient: "64b111111111111111111124",
        quantity: 3,
      },
    ],
    instructions: [
      "Boil garlics at least 1 hour",
      "Mix with heavy cream",
      "Keep in the fridge",
      "Let it sit for 1 hour",
    ],
    servings: 10,
    prepTime: 80,
    utensils: ["Pot", "Food processor"],
  },
] satisfies RecipeInput[];
