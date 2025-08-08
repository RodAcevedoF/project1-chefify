import { UserRepository, RefreshTokenRepository } from '../repositories';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors';
import { v4 as uuidv4 } from 'uuid';
import type { TokenPayload, LoginResponse } from '../types';
import { bcryptWrapper, jwtWrapper, sanitizeUser } from '../utils';
import type { IUser, UserInput } from '../schemas';
import { BadRequestError } from '../errors';
import { sendEmail } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN_DAYS = 7;
const BASE = process.env.BASE_ROUTE || '/chefify/api/v1';

export const AuthService = {
  async register(data: UserInput): Promise<Omit<IUser, 'password'>> {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new BadRequestError('Email already exists');
    const verificationToken = uuidv4();
    const userDoc = await UserRepository.createUser({
      ...data,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 4),
    });

    const verifyLink = `http://localhost:3000${BASE}/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: userDoc.email,
      type: 'VERIFICATION',
      payload: { link: verifyLink },
    });

    const resUser = sanitizeUser(userDoc);
    return resUser;
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await UserRepository.findByEmailToken(token);
    if (user) {
      await UserRepository.updateById(user._id, {
        isVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      });
      return;
    }

    const expiredUser =
      await UserRepository.findByEmailTokenIgnoreExpiry(token);
    if (expiredUser && !expiredUser.isVerified) {
      const newToken = uuidv4();
      await UserRepository.updateById(expiredUser._id, {
        emailVerificationToken: newToken,
        emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 4),
      });
      const verifyLink = `http://localhost:3000${BASE}/auth/verify-email?token=${newToken}`;
      await sendEmail({
        to: expiredUser.email,
        type: 'VERIFICATION',
        payload: { link: verifyLink },
      });

      throw new BadRequestError(
        'Verification token expired. A new link has been sent to your email.'
      );
    }

    throw new NotFoundError('User not found');
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new NotFoundError('Email provided not found');
    if (!user.isVerified) {
      throw new UnauthorizedError('Email not verified');
    }
    const isValid = await bcryptWrapper.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    const payload: TokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtWrapper.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date(
      Date.now() + REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );

    await RefreshTokenRepository.create({
      userId: user._id.toString(),
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  },

  async refresh(oldToken: string): Promise<LoginResponse> {
    const stored = await RefreshTokenRepository.findByToken(oldToken);
    if (!stored)
      throw new UnauthorizedError('Refresh token not found or revoked');

    if (stored.expiresAt < new Date()) {
      await RefreshTokenRepository.deleteByToken(oldToken);
      throw new ForbiddenError('Refresh token expired');
    }

    const user = await UserRepository.findById(stored.userId);
    if (!user) throw new NotFoundError('User not found');
    await RefreshTokenRepository.deleteByToken(oldToken);
    const payload: TokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwtWrapper.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const newRefreshToken = uuidv4();
    const expiresAt = new Date(
      Date.now() + REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );
    await RefreshTokenRepository.create({
      userId: user._id.toString(),
      token: newRefreshToken,
      expiresAt,
    });
    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    await RefreshTokenRepository.deleteByToken(refreshToken);
  },

  async logoutAll(userId: string): Promise<void> {
    await RefreshTokenRepository.deleteByUserId(userId);
  },

  async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const token = uuidv4();
    const data = {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    };
    await UserRepository.updateById(user._id, data);

    const resetLink = `http://localhost:3000${BASE}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      type: 'RESET_PASSWORD',
      payload: { link: resetLink },
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findByResetToken(token);
    if (!user) throw new BadRequestError('Invalid or expired token');
    const data = {
      resetPasswordToken: null,
      resetPasswordExpires: null,
      password: newPassword,
    };
    await UserRepository.updateById(user._id, data);
  },

  async status(userId: string): Promise<Pick<IUser, 'isVerified'>> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return { isVerified: user.isVerified };
  },
};
