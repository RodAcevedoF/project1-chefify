import bcrypt from 'bcryptjs';

export async function hashPasswordOnUpdate(
	this: unknown,
	next: (err?: Error) => void,
) {
	try {
		const ctx = this as unknown as {
			getUpdate?: () => unknown;
			setUpdate?: (u: unknown) => void;
		};
		const update =
			ctx.getUpdate ?
				(ctx.getUpdate() as Record<string, unknown> | undefined)
			:	undefined;
		if (!update) return next();

		const up = update as
			| { password?: unknown; $set?: { password?: unknown } }
			| undefined;
		const newPassword = up?.password ?? up?.$set?.password;
		if (!newPassword) return next();

		const hashed = await bcrypt.hash(String(newPassword), 10);
		const newUpdateObj: Record<string, unknown> = {
			...((update as Record<string, unknown>) || {}),
		};
		if (up?.password) {
			newUpdateObj.password = hashed;
		} else if (up?.$set) {
			newUpdateObj.$set = {
				...(up.$set as Record<string, unknown>),
				password: hashed,
			};
		} else {
			newUpdateObj.$set = { password: hashed };
		}

		ctx.setUpdate?.(newUpdateObj);
		return next();
	} catch (err) {
		return next(err as Error);
	}
}
