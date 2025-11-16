import 'dotenv/config';

type RouteOptions = {
	option: 'verify' | 'reset';
};

export const emailRoute = (token: string, { option }: RouteOptions) => {
	const target = (process.env.EMAIL_LINK_TARGET || 'frontend').toLowerCase();

	if (target === 'api') {
		const API_DOMAIN =
			process.env.API_URL || process.env.DOMAIN_URL || 'http://localhost:3000';
		const BASE_ROUTE = process.env.BASE_ROUTE || '/chefify/api/v1';
		const API_VERIFY = `${BASE_ROUTE}/auth/verify-email?token=`;
		const API_RESET = `${BASE_ROUTE}/auth/reset-password?token=`;
		return `${API_DOMAIN}${option === 'verify' ? API_VERIFY : API_RESET}${token}`;
	}

	const FRONTEND =
		process.env.FRONTEND_URL ||
		process.env.DOMAIN_URL ||
		'http://localhost:5173';
	const EMAIL_VERIFY = process.env.EMAIL_VERIFY_PATH || '/verify-email?token=';
	const EMAIL_RESET = process.env.EMAIL_RESET_PATH || '/reset-password?token=';

	return `${FRONTEND}${option === 'verify' ? EMAIL_VERIFY : EMAIL_RESET}${token}`;
};
