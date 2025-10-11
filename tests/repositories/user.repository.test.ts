import { describe, it, expect, beforeEach } from 'bun:test';
import { UserRepository } from '@/repositories';
import type { UserInput } from '@/schemas';
import { setupRepoTestDB } from '@test/mocks/repoTestSetup';
import { clearDB } from '@test/mocks/mongoServerMock';

const dummyUser: UserInput = {
	name: 'Rodrigo',
	email: 'rodrigo@example.com',
	password: 'securepassword',
	role: 'user',
	isVerified: false,
};

setupRepoTestDB();

beforeEach(async () => {
	await clearDB();
});

describe('UserRepository CRUD operations', () => {
	it('should create a user', async () => {
		await UserRepository.createUser(dummyUser);
		const user = await UserRepository.findByEmail(dummyUser.email);
		expect(user).toBeDefined();
		expect(user!.email).toBe(dummyUser.email);
	});

	it('should find a user by ID', async () => {
		await UserRepository.createUser(dummyUser);
		const created = await UserRepository.findByEmail(dummyUser.email);
		const found =
			created ? await UserRepository.findById(created._id.toString()) : null;

		expect(found).toBeDefined();
		expect(found!.email).toBe(dummyUser.email);
	});

	it('should update a user partially or fully', async () => {
		await UserRepository.createUser(dummyUser);
		const created = await UserRepository.findByEmail(dummyUser.email);
		if (!created || !created._id) throw new Error('Created user not found');
		await UserRepository.updateById(created._id.toString(), {
			name: 'Roderick Modified',
		});
		const updated = await UserRepository.findById(created._id.toString());
		expect(updated).toBeDefined();
		expect(updated!.name).toBe('Roderick Modified');
	});

	it("should delete a user and validate it's gone", async () => {
		await UserRepository.createUser(dummyUser);
		const created = await UserRepository.findByEmail(dummyUser.email);
		if (!created || !created._id) throw new Error('Created user not found');
		await UserRepository.deleteById(created._id.toString());

		const refetch = await UserRepository.findById(created._id.toString());
		expect(refetch).toBeNull();
	});
});
