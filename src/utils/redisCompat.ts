export type RedisCompat = {
	sAdd?: (key: string, member: string) => Promise<number>;
	sRem?: (key: string, member: string) => Promise<number>;
	sMembers?: (key: string) => Promise<string[]>;
	del?: (...keys: string[]) => Promise<number>;
};

export function asRedis(client: unknown): RedisCompat {
	return client as unknown as RedisCompat;
}

export default asRedis;
