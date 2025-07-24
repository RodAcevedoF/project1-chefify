import { RefreshToken } from "../models";
import type { IRefreshToken, RefreshTokenInput } from "../schemas";

export const RefreshTokenRepository = {
  // Crea un nuevo refresh token
  async create(data: RefreshTokenInput): Promise<IRefreshToken> {
    return await RefreshToken.create(data);
  },

  // Encuentra un token por su valor (para validar)
  async findByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ token });
  },

  // Elimina un token específico
  async deleteByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOneAndDelete({ token });
  },

  // Elimina todos los tokens de un usuario (ej: logout global)
  async deleteByUserId(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  },

  // Limpieza opcional de tokens expirados (tarea periódica o cron job)
  async deleteExpired(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount || 0;
  }
};
