import type { Request, Response } from 'express';
import { AuthService } from '../services';
import { successResponse } from '../utils';
import { BadRequestError, ValidationError } from '../errors';
import {
	COOKIE_OPTIONS,
	COOKIE_NAME,
	REFRESH_COOKIE_NAME,
	REFRESH_COOKIE_OPTIONS,
} from '../utils';
import type { UserInput } from '../schemas';

export const AuthController = {
	async register(req: Request, res: Response) {
		const data = req.body as UserInput;
		const created = await AuthService.register(data);
		return successResponse(res, created, 201);
	},

	async verifyEmail(req: Request, res: Response) {
		const { token } = req.query;
		if (!token) throw new BadRequestError('Invalid token');
		await AuthService.verifyEmail(token.toString());
		return successResponse(res, {
			message: 'Email verified, proceed to login',
			verified: true,
		});
	},

	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new BadRequestError('Email and password are required');
		}

		const { accessToken, refreshToken } = await AuthService.login(
			email,
			password,
		);

		if (!COOKIE_NAME || !REFRESH_COOKIE_NAME)
			throw new ValidationError(
				'COOKIE_NAME environment variable is not defined',
			);

		res
			.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS)
			.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

		return successResponse(res, { message: 'Login successful' });
	},

	async logout(req: Request, res: Response) {
		const refreshToken = req.cookies?.refreshToken;
		if (!COOKIE_NAME || !REFRESH_COOKIE_NAME) {
			throw new ValidationError(
				'COOKIE_NAME environment variable is not defined',
			);
		}

		if (refreshToken) {
			await AuthService.logout(refreshToken);
		}

		res
			.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
			.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);

		return successResponse(res, { message: 'Logged out successfully' });
	},

	async refreshToken(req: Request, res: Response) {
		const oldToken = req.cookies?.refreshToken;
		if (!oldToken) {
			throw new BadRequestError('Refresh token not provided');
		}

		const { accessToken, refreshToken } = await AuthService.refresh(oldToken);
		if (!COOKIE_NAME || !REFRESH_COOKIE_NAME)
			throw new ValidationError(
				'COOKIE_NAME environment variable is not defined',
			);

		res
			.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS)
			.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

		return successResponse(res, { message: 'Access token refreshed' });
	},

	async logoutAll(req: Request, res: Response) {
		const userId = req.params.id || req.user?.id;
		if (!userId) {
			throw new ValidationError('User ID not found in request');
		}

		await AuthService.logoutAll(userId);

		if (!COOKIE_NAME || !REFRESH_COOKIE_NAME)
			throw new ValidationError(
				'COOKIE_NAME environment variable is not defined',
			);

		res
			.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
			.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);

		return successResponse(res, { message: 'Logged out from all devices' });
	},

	async forgotPassword(req: Request, res: Response) {
		const { email } = req.body;
		if (!email) {
			throw new BadRequestError('Email is required');
		}

		await AuthService.forgotPassword(email);
		return successResponse(res, { message: 'Password reset link sent' });
	},
	async resetPassword(req: Request, res: Response) {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			throw new BadRequestError('Token and new password are required');
		}

		await AuthService.resetPassword(token, newPassword);

		return successResponse(res, { message: 'Password updated successfully' });
	},

	async status(req: Request, res: Response) {
		const userId = req?.user?.id;
		if (!userId) throw new BadRequestError('User ID not found');
		const data = await AuthService.status(userId);
		successResponse(res, data);
	},
};
