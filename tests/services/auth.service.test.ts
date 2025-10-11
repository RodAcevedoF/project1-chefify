import { test, expect, mock } from 'bun:test';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository, RefreshTokenRepository } from '../../src/repositories';
import { bcryptWrapper, jwtWrapper } from '../../src/utils/wrappers';
import type { IRefreshToken } from '../../src/schemas';
import { User } from '@/models';

const mockUser = {
	_id: '64b123456789456123456789',
	name: 'Test User',
	email: 'test@demo.com',
	password: 'hashed-password',
	role: 'user' as const,
	createdAt: new Date(),
	updatedAt: new Date(),
};
const userDoc = User.hydrate(mockUser);

UserRepository.findByEmail = mock(() => Promise.resolve(userDoc));
RefreshTokenRepository.create = mock(() =>
	Promise.resolve<IRefreshToken>({
		userId: mockUser._id,
		token: 'mocked-refresh-token',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		_id: 'mocked-refresh-id',
		updatedAt: new Date(),
		createdAt: new Date(),
	}),
);

bcryptWrapper.compare = mock(() => Promise.resolve(true));
jwtWrapper.sign = mock(() => 'mocked-access-token');

test('login returns tokens for valid credentials', async () => {
	const result = await AuthService.login('test@demo.com', 'any-password');
	expect(result.accessToken).toBe('mocked-access-token');
	expect(result.refreshToken).toBeDefined();

	expect(UserRepository.findByEmail).toHaveBeenCalledWith('test@demo.com');
	expect(bcryptWrapper.compare).toHaveBeenCalledWith(
		'any-password',
		mockUser.password,
	);
	expect(jwtWrapper.sign).toHaveBeenCalled();
});

test('return new tokens if refresh token is valid and not expired', async () => {
	const oldToken = 'old-refresh-token';
	const storedToken = {
		userId: '64b123456789456123456789',
		token: oldToken,
		expiresAt: new Date(Date.now() + 10000),
		_id: 'mocked-refresh-id',
		updatedAt: new Date(),
		createdAt: new Date(), // no ha expirado
	};

	RefreshTokenRepository.findByToken = mock(() => Promise.resolve(storedToken));
	RefreshTokenRepository.deleteByToken = mock(() =>
		Promise.resolve(storedToken),
	);
	UserRepository.findById = mock(() => Promise.resolve(userDoc));
	RefreshTokenRepository.create = mock(() =>
		Promise.resolve({} as IRefreshToken),
	);
	jwtWrapper.sign = mock(() => 'new-access-token');

	const result = await AuthService.refresh(oldToken);

	expect(result.accessToken).toBe('new-access-token');
	expect(result.refreshToken).toBeDefined();

	expect(RefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(oldToken);
	expect(RefreshTokenRepository.create).toHaveBeenCalled();
	expect(UserRepository.findById).toHaveBeenCalledWith(
		'64b123456789456123456789',
	);
});
