export function getOwnerId(rawOwner: unknown): string | null {
	if (rawOwner == null) return null;
	if (typeof rawOwner === 'string') return rawOwner;
	if (typeof rawOwner === 'object') {
		const maybe = rawOwner as Record<string, unknown>;
		const idVal =
			maybe._id ?? maybe.id ?? (maybe.toString ? maybe.toString() : null);
		return idVal != null ? String(idVal) : null;
	}
	return String(rawOwner);
}
