import 'dotenv/config';

type RouteOptions = {
	option: 'verify' | 'reset';
};

export const emailRoute = (token: string, { option }: RouteOptions) => {
	const BASE = process.env.BASE_ROUTE || '/chefify/api/v1';
	const DOMAIN = process.env.DOMAIN_URL || 'http://localhost:3000';
	const EMAIL_VERIFY = process.env.EMAIL_SUFIX || '/auth/verify-email?token=';
	const EMAIL_RESET = process.env.EMAIL_RESET || '/auth/reset-password?token=';

	return `${DOMAIN}${BASE}${option === 'verify' ? EMAIL_VERIFY : EMAIL_RESET}${token}`;
};
