import { connect, disconnect } from 'mongoose';
import { User } from '../models';
import { UserInputSchema } from '../schemas';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import logger from '../utils/logger';

const adminData = {
	name: process.env.ADMIN_NAME,
	email: process.env.ADMIN_EMAIL,
	password: process.env.ADMIN_PASS,
	role: 'admin',
	isVerified: true,
};

export const runAdminSeed = async () => {
	if (process.env.NODE_ENV !== 'development') process.exit(1);
	try {
		const db_url: string = process.env.DB_URL!;
		await connect(db_url);

		const parsed = UserInputSchema.safeParse(adminData);
		if (!parsed.success) {
			logger.error('Invalid admin data', parsed.error);
			process.exit(1);
		}

		const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
		const existing = await User.findOne({ email: parsed.data.email });
		if (existing) {
			logger.info('Admin already exists.');
		} else {
			await User.create({
				...parsed.data,
				password: hashedPassword,
			});
			logger.info('Admin created.');
		}
	} catch (err) {
		logger.error('Error creating admin:', err);
		process.exit(1);
	} finally {
		await disconnect();
	}
};

runAdminSeed();
