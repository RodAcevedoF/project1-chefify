type LogFn = (...args: unknown[]) => void;

const isDev = process.env.NODE_ENV !== 'production';

let impl = {
	info: (...args: unknown[]) => {
		if (isDev) console.info('[chefify]', ...args);
	},
	warn: (...args: unknown[]) => {
		console.warn('[chefify]', ...args);
	},
	error: (...args: unknown[]) => {
		console.error('[chefify]', ...args);
	},
	debug: (...args: unknown[]) => {
		if (process.env.NODE_ENV === 'development')
			console.debug('[chefify]', ...args);
	},
};

export const setImplementation = (
	next: Partial<Record<keyof typeof impl, LogFn>>,
) => {
	impl = { ...impl, ...next };
};

const logger = {
	info: (...args: unknown[]) => impl.info(...args),
	warn: (...args: unknown[]) => impl.warn(...args),
	error: (...args: unknown[]) => impl.error(...args),
	debug: (...args: unknown[]) => impl.debug(...args),
};

export default logger;
