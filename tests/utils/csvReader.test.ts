import { readRecipeCsv } from "../../src/utils/csvReader"; // ajustá el path
import { describe, expect, it } from "bun:test";

describe("readRecipeCsv", () => {
  it("should parse full recipe CSV correctly", async () => {
    const csvContent = `title,ingredients,instructions,categories,servings,prepTime,utensils
Chickpea Stew,"[{""ingredient"":""64c333333333333333333331"",""quantity"":200},{""ingredient"":""64d222222222222222222222"",""quantity"":100}]","[""Soak chickpeas overnight"",""Boil for 1 hour"",""Add spices and simmer""]","[""Vegan"",""Mediterranean""]",4,15,"[""Pot"",""Spoon""]"`;

    const mockFile = {
      buffer: Buffer.from(csvContent)
    } as Express.Multer.File;

    const result = await readRecipeCsv(mockFile);

    expect(result).toEqual([
      {
        title: "Chickpea Stew",
        ingredients: [
          { ingredient: "64c333333333333333333331", quantity: 200 },
          { ingredient: "64d222222222222222222222", quantity: 100 }
        ],
        instructions: [
          "Soak chickpeas overnight",
          "Boil for 1 hour",
          "Add spices and simmer"
        ],
        categories: ["Vegan", "Mediterranean"],
        servings: 4,
        prepTime: 15,
        utensils: ["Pot", "Spoon"]
      }
    ]);
  });
});
