export class AppError extends Error {
	public statusCode: number;
	public isApp: true = true;
	public code?: string;
	public details?: unknown;

	constructor(
		message: string,
		statusCode = 500,
		code?: string,
		details?: unknown,
	) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
	}
}
