import { AppError } from './AppError';

export class ValidationError extends AppError {
	constructor(message = 'Invalid Data', code?: string, details?: unknown) {
		super(message, 400, code, details);
	}
}
