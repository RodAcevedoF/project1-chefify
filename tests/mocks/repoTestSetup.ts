import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { connectDB, clearDB, disconnectDB } from '../mocks/mongoServerMock';

export function setupRepoTestDB() {
	beforeAll(async () => {
		await connectDB();
	});

	afterAll(async () => {
		await disconnectDB();
	});

	beforeEach(async () => {
		await clearDB();
	});
}
