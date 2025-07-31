import { describe, it, expect } from "bun:test";
import { RefreshTokenRepository } from "../../src/repositories";
import { setupRepoTestDB } from "../mocks/repoTestSetup";
import type { RefreshTokenInput } from "../../src/schemas";

setupRepoTestDB();

const tokenData: RefreshTokenInput = {
  token: "test-token-123",
  userId: "65c123456789456123456789",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h +
};

const expiredTokenData: RefreshTokenInput = {
  token: "expired-token",
  userId: "65c123456789456123456789",
  expiresAt: new Date(Date.now() - 1000 * 60), // expired -1min
};

describe("RefreshTokenRepository operations", () => {
  it("should create and find a refresh token", async () => {
    const created = await RefreshTokenRepository.create(tokenData);
    expect(created.token).toBe(tokenData.token);

    const found = await RefreshTokenRepository.findByToken(tokenData.token);
    expect(found?.userId.toString()).toBe(tokenData.userId);
    await RefreshTokenRepository.deleteByToken(tokenData.token);
  });

  it("should delete a refresh token by value", async () => {
    await RefreshTokenRepository.create(tokenData);
    const deleted = await RefreshTokenRepository.deleteByToken(tokenData.token);
    expect(deleted?.token).toBe(tokenData.token);

    const shouldBeGone = await RefreshTokenRepository.findByToken(
      tokenData.token
    );
    expect(shouldBeGone).toBe(null);
  });

  it("should delete all tokens for a user", async () => {
    await RefreshTokenRepository.create(tokenData);
    await RefreshTokenRepository.deleteByUserId(tokenData.userId);

    const postDelete = await RefreshTokenRepository.findByToken(
      tokenData.token
    );
    expect(postDelete).toBeNull();
  });

  it("should delete expired tokens", async () => {
    await RefreshTokenRepository.create(tokenData);
    await RefreshTokenRepository.create(expiredTokenData);

    const deletedCount = await RefreshTokenRepository.deleteExpired();
    expect(deletedCount).toBe(1);
  });
});
