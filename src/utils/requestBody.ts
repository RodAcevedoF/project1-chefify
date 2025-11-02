import { BadRequestError } from '../errors';
import type { Express } from 'express';

export function extractPayload(raw: unknown): unknown {
	if (!raw) return raw;

	const shaped = raw as { payload?: unknown } | undefined;
	if (!shaped || shaped.payload === undefined) return raw;

	const payload = shaped.payload;
	if (typeof payload === 'string') {
		try {
			return JSON.parse(payload);
		} catch {
			throw new BadRequestError('Invalid JSON payload');
		}
	}
	return payload;
}

export function extractFileBuffer(req: unknown): Buffer | undefined {
	const maybe = req as unknown as { file?: Express.Multer.File } | undefined;
	return maybe?.file?.buffer as Buffer | undefined;
}

export default {
	extractPayload,
	extractFileBuffer,
};
