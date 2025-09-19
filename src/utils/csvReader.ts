import { parse } from "csv-parse/sync";
import type { IngredientInput, RecipeInput } from "../schemas";

interface CsvReaderParams {
  content: string;
  delimiter?: string;
}

export const csvReader = <T = Record<string, string>>({
  content,
  delimiter = ","
}: CsvReaderParams): T[] => {
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      trim: true,
      quote: '"',
      escape: '"'
    });

    return records as T[];
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
};

export const readRecipeCsv = async (
  file: Express.Multer.File
): Promise<Partial<RecipeInput>[]> => {
  const content = file.buffer.toString("utf-8");

  const rawRecords = csvReader<Partial<RecipeInput>>({ content });

  const records = rawRecords.map((record) => {
    try {
      return {
        ...record,
        ingredients: JSON.parse(String(record.ingredients ?? "[]")),
        instructions: JSON.parse(String(record.instructions ?? "[]")),
        categories: JSON.parse(String(record.categories ?? "[]")),
        utensils: JSON.parse(String(record.utensils ?? "[]")),
        servings: Number(record.servings),
        prepTime: Number(record.prepTime)
      };
    } catch (err) {
      console.warn("Error parsing a record:", record, err);
      return record;
    }
  });

  return records;
};

export const readIngredient = async (
  file: Express.Multer.File
): Promise<Partial<IngredientInput>[]> => {
  const content = file.buffer.toString("utf-8");

  const rawRecords = csvReader<Partial<IngredientInput>>({ content });

  const records = rawRecords.map((record) => {
    try {
      return {
        ...record,
        name: JSON.parse(String(record.name ?? "")),
        unit: JSON.parse(String(record.unit ?? ""))
      };
    } catch (err) {
      console.warn("Error parsing a record:", record, err);
      return record; // O podrías descartar según tu criterio
    }
  });

  return records;
};
