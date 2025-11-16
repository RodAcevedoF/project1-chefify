import { AppError } from './AppError';

export class NotFoundError extends AppError {
	constructor(
		message = 'Resource not found',
		code?: string,
		details?: unknown,
	) {
		super(message, 404, code, details);
	}
}
