import app from './src/app.js';
import { connectDB } from './src/config/mongo.config.ts';
import config from './src/config/config.ts';
import logger from './src/utils/logger';

async function startServer() {
	try {
		await connectDB();
		logger.info('MongoDB connected');

		app.listen(config.port, '0.0.0.0', () => {
			logger.info(`Server running on port ${config.port}`);
		});
	} catch (err) {
		if (err instanceof Error) {
			logger.error('Connection error', err.stack);
		} else {
			logger.error('Connection error', err);
		}
		process.exit(1);
	}
}

if (process.env.NODE_ENV !== 'test') {
	startServer();
}

export default app;
