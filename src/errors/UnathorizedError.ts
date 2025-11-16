import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
	constructor(
		message = 'Missing or invalid credentials',
		code?: string,
		details?: unknown,
	) {
		super(message, 403, code, details);
	}
}
