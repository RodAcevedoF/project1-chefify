import { AppError } from './AppError';

export class ConflictError extends AppError {
	constructor(
		message = 'Conflict: resource already exists',
		code?: string,
		details?: unknown,
	) {
		super(message, 409, code, details);
	}
}
