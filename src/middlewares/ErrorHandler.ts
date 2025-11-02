import type { Request, Response, NextFunction } from 'express';
import { isAppError } from '../utils';
import logger from '../utils/logger';

export const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const isKnownError = err instanceof Error;
	const statusCode =
		isKnownError && isAppError(err) ? (err.statusCode ?? 500) : 500;
	const message = isKnownError ? err.message : 'Internal Server Error';
	const stack = isKnownError ? err.stack : undefined;

	const response: Record<string, unknown> = {
		success: false,
		error: message,
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
