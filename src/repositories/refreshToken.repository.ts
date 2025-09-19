import { RefreshToken } from "../models";
import type { IRefreshToken, RefreshTokenInput } from "../schemas";

export const RefreshTokenRepository = {
  async create(data: RefreshTokenInput): Promise<IRefreshToken> {
    return await RefreshToken.create(data);
  },

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ token });
  },

  async deleteByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOneAndDelete({ token });
  },

  async deleteByUserId(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  },

  async deleteExpired(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  },
};
