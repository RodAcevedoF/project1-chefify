import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer;

export async function connectDB() {
	mongo = await MongoMemoryServer.create();
	const uri = mongo.getUri();
	await mongoose.connect(uri, {
		dbName: 'bun-test',
	});
}

export async function disconnectDB() {
	await mongoose.disconnect();
	await mongo.stop();
}

export async function clearDB() {
	const collections = mongoose.connection.collections;
	const keys = Object.keys(collections);

	// If there are no collections yet, nothing to clear.
	if (keys.length === 0) return;

	for (const key of keys) {
		const collection = collections[key];
		if (collection) {
			try {
				await collection.deleteMany({});
			} catch (err) {
				// ignore individual collection errors in cleanup
			}
		}
	}
}
