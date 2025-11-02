import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/ErrorHandler';
import { loadCheckers, loadMiddlewares, loadRoutes } from './utils';

dotenv.config();

const app = express();

app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

loadMiddlewares(app);

loadCheckers(app);

loadRoutes(app);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: 'Route not found',
	});
});

app.use(errorHandler);

export default app;
