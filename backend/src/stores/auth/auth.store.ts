import { loadConfig } from "../../config";
import { getRedisClient } from "../../infrastructure/redis/client";
import { hashValue } from "../../shared/hash/hash";

class AuthStore {
  private _redis: ReturnType<typeof getRedisClient> | null = null;
  private _config: ReturnType<typeof loadConfig> | null = null;

  private get redis() {
    if (!this._redis) {
      this._redis = getRedisClient();
    }
    return this._redis;
  }

  private get config() {
    if (!this._config) {
      this._config = loadConfig();
    }
    return this._config;
  }

  private key(userId: string, token: string) {
    return `refresh:${userId}:${hashValue(token)}`;
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 600;
    }
  }

  async storeRefeshToken(token: string, userId: string) {
    const key = this.key(userId, token);

    const result = await this.redis.set(
      key,
      token,
      "EX",
      this.parseExpiry(this.config.jwt.rfExpiry),
    );

    return result === "OK";
  }

  async invalidateToken(
    token: string,
    userId: string,
  ) {
    const key = this.key(userId, token);
    await this.redis.del(key);
  }

  async getRefreshToken(
    token: string,
    userId: string,
  ): Promise<string | null> {
    const key = this.key(userId, token);
    const result = await this.redis.get(key);
    return result ?? null;
  }
}

export const authStore = new AuthStore();
