import { OpenAI } from "openai";
import { AppError } from "../errors";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getSuggestedRecipe(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  const messageContent = response.choices[0]?.message?.content;
  if (!messageContent) {
    throw new AppError("No response content from OpenAI");
  }

  const cleaned = messageContent
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^`+|`+$/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new AppError("Failed to parse suggested recipe JSON: " + error);
  }
}
