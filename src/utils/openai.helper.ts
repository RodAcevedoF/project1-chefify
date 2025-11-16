import { OpenAI } from 'openai';
import { AppError } from '../errors';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getSuggestedRecipe(prompt: string) {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4.1-mini',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.9,
			top_p: 0.95,
			response_format: { type: 'json_object' },
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new AppError('OpenAI returned empty response');
		}

		return JSON.parse(content);
	} catch (err) {
		throw new AppError('Failed to fetch or parse recipe: ' + err);
	}
}
