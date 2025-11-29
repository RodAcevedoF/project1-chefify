const COOKIE_NAME = process.env.COOKIE_NAME;
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	maxAge: 1000 * 60 * 60,
};

export { COOKIE_NAME, COOKIE_OPTIONS };
