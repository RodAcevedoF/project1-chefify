import type { Express } from 'express';
import {
	ingredientRoutes,
	userRoutes,
	authRoutes,
	recipeRoutes,
	adminRoutes,
	mediaRoutes,
	followRoutes,
	likeRoutes,
} from '../routes';

const base = process.env.BASE_ROUTE || '/chefify/api/v1';

export const loadRoutes = (app: Express) => {
	app.use(`${base}/recipe`, recipeRoutes);
	app.use(`${base}/user`, userRoutes);
	app.use(`${base}/ingredient`, ingredientRoutes);
	app.use(`${base}/auth`, authRoutes);
	app.use(`${base}/admin`, adminRoutes);
	app.use(`${base}/media`, mediaRoutes);
	app.use(`${base}/follow`, followRoutes);
	app.use(`${base}/like`, likeRoutes);
};
