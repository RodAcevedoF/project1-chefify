import { parse } from 'csv-parse/sync';
import logger from '../utils/logger';
import type { IngredientInput, RecipeInput } from '../schemas';
import XLSX from 'xlsx';

interface CsvReaderParams {
	content: string;
	delimiter?: string;
}

export const csvReader = <T = Record<string, string>>({
	content,
	delimiter = ',',
}: CsvReaderParams): T[] => {
	try {
		const records = parse(content, {
			columns: true,
			skip_empty_lines: true,
			delimiter,
			trim: true,
			quote: '"',
			escape: '"',
		});

		return records as T[];
	} catch (error) {
		logger.error('Error parsing CSV:', error);
		return [];
	}
};

export const readRecipeCsv = async (
	file: Express.Multer.File,
): Promise<Partial<RecipeInput>[]> => {
	const filename = file.originalname || '';
	const isExcel =
		filename.toLowerCase().endsWith('.xlsx') ||
		filename.toLowerCase().endsWith('.xls') ||
		/spreadsheet/.test(file.mimetype);

	let rawRecords: Record<string, unknown>[] = [];

	if (isExcel) {
		try {
			const wb = XLSX.read(file.buffer, { type: 'buffer' });
			const sheetName = wb.SheetNames[0];
			if (!sheetName) return [];
			const sheet = wb.Sheets[sheetName as string];
			const json = XLSX.utils.sheet_to_json(sheet as XLSX.Sheet, {
				defval: '',
			}) as Record<string, unknown>[];
			rawRecords = json;
		} catch (err) {
			logger.error('Error reading Excel file for recipes:', err);
			return [];
		}
	} else {
		const content = file.buffer.toString('utf-8');
		rawRecords = csvReader<Record<string, string>>({
			content,
		}) as unknown as Record<string, unknown>[];
	}

	const parseMaybeJson = (v: unknown) => {
		if (Array.isArray(v)) return v;
		if (v === null || v === undefined) return [];
		if (typeof v === 'object') return v;
		const s = String(v).trim();
		if (!s) return [];
		try {
			return JSON.parse(s);
		} catch {
			if (s.includes(',')) return s.split(',').map((x) => x.trim());
			return s;
		}
	};

	const records = rawRecords.map((record) => {
		try {
			const r: Record<string, unknown> = { ...record };

			r.ingredients = parseMaybeJson(
				record['ingredients'] ?? record['Ingredients'] ?? '[]',
			);
			r.instructions = parseMaybeJson(
				record['instructions'] ?? record['Instructions'] ?? '[]',
			);
			r.categories = parseMaybeJson(
				record['categories'] ?? record['Categories'] ?? '[]',
			);
			r.utensils = parseMaybeJson(
				record['utensils'] ?? record['Utensils'] ?? '[]',
			);

			const servingsRaw = record['servings'] ?? record['Servings'] ?? '';
			const prepRaw = record['prepTime'] ?? record['prepTime'] ?? '';

			r.servings = Number(servingsRaw) || undefined;
			r.prepTime = Number(prepRaw) || undefined;

			return r as Partial<RecipeInput>;
		} catch (err) {
			logger.warn('Error parsing a record:', record, err);
			return record as Partial<RecipeInput>;
		}
	});

	return records;
};

export const readIngredient = async (
	file: Express.Multer.File,
): Promise<Partial<IngredientInput>[]> => {
	const content = file.buffer.toString('utf-8');

	const rawRecords = csvReader<Partial<IngredientInput>>({ content });

	const records = rawRecords.map((record) => {
		try {
			return {
				...record,
				name: JSON.parse(String(record.name ?? '')),
				unit: JSON.parse(String(record.unit ?? '')),
			};
		} catch (err) {
			logger.warn('Error parsing a record:', record, err);
			return record;
		}
	});

	return records;
};

import type { UserInput } from '../schemas/user.schema';

export const readUsersCsv = async (
	file: Express.Multer.File,
): Promise<Partial<UserInput>[]> => {
	const filename = file.originalname || '';
	const isExcel =
		filename.toLowerCase().endsWith('.xlsx') ||
		filename.toLowerCase().endsWith('.xls') ||
		/spreadsheet/.test(file.mimetype);

	let rawRecords: Record<string, unknown>[] = [];

	if (isExcel) {
		try {
			const wb = XLSX.read(file.buffer, { type: 'buffer' });
			const sheetName = wb.SheetNames[0];
			if (!sheetName) return [];
			const sheet = wb.Sheets[sheetName as string];
			const json = XLSX.utils.sheet_to_json(sheet as XLSX.Sheet, {
				defval: '',
			}) as Record<string, unknown>[];
			rawRecords = json;
		} catch {
			return [];
		}
	} else {
		const content = file.buffer.toString('utf-8');
		rawRecords = csvReader<Record<string, string>>({
			content,
		}) as unknown as Record<string, unknown>[];
	}

	const records = rawRecords.map((rec) => {
		const r: Record<string, unknown> = {};
		for (const k of Object.keys(rec)) {
			const key = String(k).trim();
			const v = rec[k];
			r[key] = v;
		}

		return r as Partial<UserInput>;
	});

	return records;
};
