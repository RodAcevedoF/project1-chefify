//import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { generalRateLimiter } from '../middlewares/rateLimit';
import { type Express, json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { redisClient } from '../config/redis.config';
import logger from './logger';
import { getRedisStore } from './sessionStore';

const RedisStore = getRedisStore(session as unknown as typeof session);

export const loadMiddlewares = (app: Express) => {
	// Security has been moved into proxy server (nginx)
	//app.use(helmet());

	app.use(morgan('dev'));

	app.use(
		cors({
			origin: process.env.FRONTEND_URL,
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		}),
	);
	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	}
	// Parsers
	app.use(json());
	app.use(urlencoded({ extended: true }));
	app.use(cookieParser());
	// Session middleware (uses Redis now)
	try {
		const sessionSecret = process.env.SESSION_SECRET || 'change-me';
		const sessionName = process.env.SESSION_COOKIE_NAME || 'sid';

		if (RedisStore) {
			logger.info('Session store: Redis');
		} else {
			logger.info(
				'Session store: Memory (fallback) — RedisStore not available',
			);
		}

		app.use(
			session({
				store:
					RedisStore ?
						new RedisStore({ client: redisClient as unknown })
					:	undefined,
				name: sessionName,
				secret: sessionSecret,
				resave: false,
				saveUninitialized: false,
				cookie: {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'none',
					maxAge:
						Number(process.env.SESSION_MAX_AGE) || 1000 * 60 * 60 * 24 * 7,
				},
			}),
		);
	} catch (err) {
		logger.warn('Warning: session middleware could not be configured', err);
	}
	//Rate Limiter
	app.use(generalRateLimiter);
};
