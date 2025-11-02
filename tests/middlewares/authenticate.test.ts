import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'bun:test';
import { authenticate } from '@/middlewares/authenticate';
import { errorHandler } from '@/middlewares/ErrorHandler';

describe('Middleware authenticate (session-first)', () => {
	it('allows requests with session user and exposes req.user', async () => {
		const app = express();
		app.use(express.json());

		app.get(
			'/with-session',
			(req, _res, next) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore - attach a mock session for test
				req.session = { user: { id: 'u1', role: 'USER', email: 'a@b.com' } };
				next();
			},
			authenticate(),
			(req, res) => {
				res.json({ user: req.user });
			},
		);

		app.use(errorHandler);

		const res = await request(app).get('/with-session');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			user: { id: 'u1', role: 'USER', email: 'a@b.com' },
		});
	});

	it('rejects requests without session user with 401', async () => {
		const app = express();
		app.use(express.json());

		app.get('/no-session', authenticate(), (_req, _res) => {
			// should not be reached
			return _res.status(200).send('ok');
		});

		app.use(errorHandler);

		const res = await request(app).get('/no-session');
		expect(res.status).toBe(403);
		expect(res.body).toMatchObject({
			success: false,
			error: 'Not authenticated',
			statusCode: 403,
		});
	});
});
