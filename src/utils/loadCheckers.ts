import type { Express } from 'express';
import { redisClient } from '../config/redis.config';
import mongoose from 'mongoose';

export const loadCheckers = (app: Express) => {
	app.get('/chefify/api/v1/ping', (_req, res) => {
		res.json({ message: 'Server is running!' });
	});

	app.get('/chefify/api/v1/health', async (_req, res) => {
		const uptime = process.uptime();
		const result: Record<string, unknown> = { status: 'ok', uptime };

		// Check Redis
		try {
			const pong = await redisClient.ping();
			result.redis =
				pong === 'PONG' ? { status: 'ok' } : { status: 'warn', resp: pong };
		} catch (err) {
			result.redis = { status: 'error', error: String(err) };
		}

		// Check Mongo
		try {
			const state = mongoose.connection.readyState;
			result.mongo = { state };
			if (state !== 1) {
				result.status = 'degraded';
			}
		} catch (err) {
			result.mongo = { status: 'error', error: String(err) };
			result.status = 'degraded';
		}

		const degraded = result.status !== 'ok';
		return res.status(degraded ? 503 : 200).json(result);
	});
};
