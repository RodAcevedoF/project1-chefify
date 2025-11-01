import * as connectRedis from 'connect-redis';
import type { Store } from 'express-session';
import type sessionType from 'express-session';

import logger from './logger';

type StoreConstructor = new (...args: unknown[]) => Store;
type ModuleRecord = Record<string, unknown>;

export function getRedisStore(
	sessionModule: typeof sessionType,
): StoreConstructor | null {
	const mod = connectRedis as unknown as ModuleRecord;

	const tryResolveRedisStore = (
		candidate: unknown,
	): StoreConstructor | null => {
		if (!candidate) return null;

		if (typeof candidate === 'function') {
			try {
				const result = (candidate as Function)(sessionModule);
				if (typeof result === 'function') {
					return result as StoreConstructor;
				}
			} catch (error) {
				if (isClassConstructorError(error)) {
					return candidate as StoreConstructor;
				}
			}
		}
		return null;
	};

	const namedExport = tryResolveRedisStore(mod.RedisStore ?? mod['RedisStore']);
	if (namedExport) {
		logger.debug('Resolved RedisStore via named export');
		return namedExport;
	}

	const defaultExport = tryResolveRedisStore(mod.default ?? connectRedis);
	if (defaultExport) {
		logger.debug('Resolved RedisStore via default export/factory');
		return defaultExport;
	}

	const moduleAsFunction = tryResolveRedisStore(connectRedis);
	if (moduleAsFunction) {
		logger.debug('Resolved RedisStore via module function export');
		return moduleAsFunction;
	}

	logger.debug('No compatible RedisStore export shape detected');
	return null;
}

function isClassConstructorError(error: unknown): boolean {
	return (
		error instanceof Error &&
		/Cannot call a class constructor without|class constructor/i.test(
			error.message,
		)
	);
}

export default getRedisStore;
