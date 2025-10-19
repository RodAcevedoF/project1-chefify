export function snapshotModule(target: any) {
	const snapshot: Record<string, any> = {};
	for (const key of Object.keys(target)) {
		snapshot[key] = (target as any)[key];
	}
	return () => {
		for (const key of Object.keys(snapshot)) {
			try {
				(target as any)[key] = snapshot[key];
			} catch (err) {
				// ignore
			}
		}
	};
}

export function prepareModuleForMocks(target: any, keys: string[]) {
	for (const k of keys) {
		try {
			(target as any)[k] = undefined as any;
		} catch (err) {
			// ignore
		}
	}
}
