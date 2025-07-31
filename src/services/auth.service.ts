import { UserRepository, RefreshTokenRepository } from "../repositories";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "../errors";
import { v4 as uuidv4 } from "uuid";
import type { TokenPayload, LoginResponse } from "../types";
import { bcryptWrapper, jwtWrapper } from "../utils";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "1h";
const REFRESH_EXPIRES_IN_DAYS = 7;

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new NotFoundError("Email provided not found");

    const isValid = await bcryptWrapper.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError("Invalid credentials");

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

    // Guarda el refresh token en la DB
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
      throw new UnauthorizedError("Refresh token not found or revoked");

    if (stored.expiresAt < new Date()) {
      await RefreshTokenRepository.deleteByToken(oldToken);
      throw new ForbiddenError("Refresh token expired");
    }

    const user = await UserRepository.findById(stored.userId);
    if (!user) throw new NotFoundError("User not found");

    // Invalida el viejo token (paso clave)
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
};
