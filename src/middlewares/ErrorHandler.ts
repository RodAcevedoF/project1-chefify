import type { Request, Response, NextFunction } from 'express';
import { isAppError } from '../utils';
import logger from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const isKnownError = err instanceof Error;

	let statusCode =
		isKnownError && isAppError(err) ? (err.statusCode ?? 500) : 500;
	let message = isKnownError ? err.message : 'Internal Server Error';
	const stack = isKnownError ? err.stack : undefined;
	let code =
		isKnownError && isAppError(err) ? (err.code ?? undefined) : undefined;
	let details = isKnownError && isAppError(err) ? err.details : undefined;

	if (err instanceof ZodError) {
		statusCode = 400;
		const issues = err.issues || [];
		message = issues
			.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
			.join('; ');
		details = issues;
		code = code ?? 'VALIDATION_ERROR';
	}
	const isMongooseValidationError = (
		e: unknown,
	): e is {
		name: string;
		errors?: Record<string, { message?: string }>;
		message?: string;
	} => {
		return (
			typeof e === 'object' &&
			e !== null &&
			'name' in e &&
			(e as Record<string, unknown>).name === 'ValidationError' &&
			'errors' in e
		);
	};

	if (!(err instanceof ZodError) && isMongooseValidationError(err)) {
		statusCode = 400;
		const es = err.errors || {};
		const msgs = Object.values(es)
			.map((e) => e?.message)
			.filter(Boolean) as string[];
		const maybeMessage = err.message;
		message = msgs.join('; ') || maybeMessage || message;
		details = es as unknown;
		code = code ?? 'VALIDATION_ERROR';
	}

	const response: Record<string, unknown> = {
		success: false,
		message,
		//backward-compat
		error: message,
		...(code ? { code } : {}),
		...(details ? { details } : {}),
		...(process.env.NODE_ENV === 'development' && { stack }),
	};

	if (isKnownError && isAppError(err)) {
		response.statusCode = statusCode;
	}

	void _next;

	if (process.env.NODE_ENV === 'development') {
		logger.error('ERROR →', err);
	}

	res.status(statusCode).json(response);
};
