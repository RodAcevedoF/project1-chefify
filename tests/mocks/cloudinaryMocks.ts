import { jest } from 'bun:test';
import logger from '../../src/utils/logger';

export const mockUploader = {
	upload_stream: jest.fn((options, callback) => {
		const { Writable } = require('stream');
		const stream = new Writable();

		stream._write = (chunk: string, encoding: string, done: () => {}) => {
			callback(null, {
				secure_url: 'https://mocked.cloudinary.com/fake-stream-upload.jpg',
				public_id: 'mocked-stream-id',
			});
			done();
		};

		return stream;
	}),

	deleteFromCloudinary: jest.fn(async (publicId: string) => {
		logger.debug(`Mock delete called for: ${publicId}`);
		return Promise.resolve();
	}),
};
