import { FollowService } from '../../src/services/follow.service';
import { FollowRepository, UserRepository } from '../../src/repositories';
import { UserService } from '../../src/services/user.service';
import { beforeEach, afterEach, expect, test, mock } from 'bun:test';
import {
	snapshotModule,
	prepareModuleForMocks,
} from '../test-utils/reset-mocks';

const restoreFollowRepo = snapshotModule(FollowRepository);
const restoreUserRepo = snapshotModule(UserRepository);
const restoreUserService = snapshotModule(UserService);

beforeEach(() => {
	prepareModuleForMocks(FollowRepository, [
		'create',
		'delete',
		'countFollowers',
		'countFollowing',
		'getFollowers',
		'getFollowing',
	]);
	prepareModuleForMocks(UserService, ['getUserById']);
	prepareModuleForMocks(UserRepository, [
		'incFollowersCount',
		'incFollowingCount',
	]);
});

afterEach(() => {
	restoreFollowRepo();
	restoreUserRepo();
	restoreUserService();
});

test('follow: success increments counters', async () => {
	UserService.getUserById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	FollowRepository.create = mock((data: any) => Promise.resolve());
	UserRepository.incFollowersCount = mock(() => Promise.resolve());
	UserRepository.incFollowingCount = mock(() => Promise.resolve());

	await FollowService.follow('u1', 'u2');
	expect(FollowRepository.create).toHaveBeenCalled();
	expect(UserRepository.incFollowersCount).toHaveBeenCalledWith('u2', 1);
	expect(UserRepository.incFollowingCount).toHaveBeenCalledWith('u1', 1);
});

test('follow: duplicate is idempotent', async () => {
	UserService.getUserById = mock((id: string) =>
		Promise.resolve({ id } as any),
	);
	FollowRepository.create = mock(() => Promise.reject({ code: 11000 }));
	UserRepository.incFollowersCount = mock(() => Promise.resolve());
	UserRepository.incFollowingCount = mock(() => Promise.resolve());

	await FollowService.follow('u1', 'u2');
	expect(FollowRepository.create).toHaveBeenCalled();
	// counters should not be incremented because create failed as duplicate
	expect(UserRepository.incFollowersCount).not.toHaveBeenCalled();
});

test('follow: follower not found', async () => {
	UserService.getUserById = mock((id: string) => Promise.resolve(null as any));
	await expect(FollowService.follow('u1', 'u2')).rejects.toThrow();
});

test('unfollow: delete decrements counters when deleted', async () => {
	FollowRepository.delete = mock(() =>
		Promise.resolve({
			follower: 'u1',
			following: 'u2',
			_id: 'deleted',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any),
	);
	UserRepository.incFollowersCount = mock(() => Promise.resolve());
	UserRepository.incFollowingCount = mock(() => Promise.resolve());

	await FollowService.unfollow('u1', 'u2');
	expect(FollowRepository.delete).toHaveBeenCalledWith('u1', 'u2');
	expect(UserRepository.incFollowersCount).toHaveBeenCalledWith('u2', -1);
});
