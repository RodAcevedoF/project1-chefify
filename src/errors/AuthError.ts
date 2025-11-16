import { AppError } from './AppError';

export class AuthError extends AppError {
	constructor(
		message = 'Authentication required',
		code?: string,
		details?: unknown,
	) {
		super(message, 401, code, details);
	}
}
