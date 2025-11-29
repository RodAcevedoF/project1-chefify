import { createClient } from 'redis';
import logger from '@/utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
	logger.error('Redis error:', err);
});

redisClient.connect().catch((err) => {
	logger.error('Redis connection failed:', err);
});

export default redisClient;
