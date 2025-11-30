import 'dotenv/config';

type RouteOptions = {
	option: 'verify' | 'reset';
};

export const emailRoute = (token: string, { option }: RouteOptions) => {
	const target = (process.env.EMAIL_LINK_TARGET || 'frontend').toLowerCase();

	if (target === 'api') {
		const API_URL = process.env.API_URL;
		const API_VERIFY = `/auth/verify-email?token=`;
		const API_RESET = `/auth/reset-password?token=`;
		return `${API_URL}${option === 'verify' ? API_VERIFY : API_RESET}${token}`;
	}

	const FRONTEND = process.env.FRONTEND_URL;
	const EMAIL_VERIFY = process.env.EMAIL_VERIFY_PATH || '/verify-email?token=';
	const EMAIL_RESET = process.env.EMAIL_RESET_PATH || '/reset-password?token=';

	return `${FRONTEND}${option === 'verify' ? EMAIL_VERIFY : EMAIL_RESET}${token}`;
};
