import type { Request } from 'express';

export interface ExtendedRequest extends Request {
	fileUrl?: string;
	filePublicId?: string;
}

export type JWTPayload = {
	id: string;
	role: string;
	email: string;
	iat: number;
	exp: number;
};

export type TokenPayload = {
	id: string;
	email: string;
	role: string;
};

export type LoginResponse = {
	userId?: string;
	message?: string;
};

export type EmailType = 'VERIFICATION' | 'RESET_PASSWORD';
export interface SendEmailOptions {
	to: string;
	type: EmailType;
	payload: {
		link: string;
	};
}

export type ingredientPromptType = {
	name: string;
	unit: 'unit' | 'gr' | 'ml' | 'tsp' | 'tbsp' | 'cloves';
	quantity: number;
};

export interface SearchParams {
	sort?: 'asc' | 'desc' | 1 | -1;
	limit?: number;
	skip?: number;
	id?: string;
	query?: Record<string, unknown>;
}
