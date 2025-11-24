export function normalizeAIUsage(aiUsage?: {
	count: number;
	lastReset: Date;
}): { count: number; lastReset: Date } {
	const now = new Date();

	if (!aiUsage) {
		return {
			count: 0,
			lastReset: now,
		};
	}

	const diffInHours =
		(now.getTime() - aiUsage.lastReset.getTime()) / (1000 * 60 * 60);

	if (diffInHours >= 24) {
		return {
			count: 0,
			lastReset: now,
		};
	}

	return aiUsage;
}

export function shouldResetAIUsage(aiUsage?: {
	count: number;
	lastReset: Date;
}): boolean {
	if (!aiUsage) return true;
	const now = new Date();
	const diffInHours =
		(now.getTime() - aiUsage.lastReset.getTime()) / (1000 * 60 * 60);
	return diffInHours >= 24;
}
