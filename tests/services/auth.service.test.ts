import { test, expect, mock } from 'bun:test';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories';
import { bcryptWrapper } from '../../src/utils/wrappers';
import { User } from '@/models';

const mockUser = {
	_id: '64b123456789456123456789',
	name: 'Test User',
	email: 'test@demo.com',
	password: 'hashed-password',
	role: 'user' as const,
	isVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};
const userDoc = User.hydrate(mockUser);

UserRepository.findByEmail = mock(() => Promise.resolve(userDoc));
bcryptWrapper.compare = mock(() => Promise.resolve(true));

test('login returns user info for valid credentials', async () => {
	const result = await AuthService.login('test@demo.com', 'any-password');
	expect(result).toEqual({
		id: String(mockUser._id),
		email: mockUser.email,
		role: mockUser.role,
	});

	expect(UserRepository.findByEmail).toHaveBeenCalledWith('test@demo.com');
	expect(bcryptWrapper.compare).toHaveBeenCalledWith(
		'any-password',
		mockUser.password,
	);
});
