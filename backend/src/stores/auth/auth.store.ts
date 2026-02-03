import { loadConfig } from "../../config";
import { getRedisClient } from "../../infrastructure/redis/client";

class AuthStore {
  private redis = getRedisClient();

  private config = loadConfig();

  private key(userId: string, token: string) {
    return `refresh:${userId}:${token}`;
  }

  async storeRefeshToken(token: string, userId: string) {
    const key = this.key(userId, token);

    const result = await this.redis.set(
      key,
      token,
      "EX",
      this.config.jwt.rfExpiry,
    );

    return result === "OK";
  }

  async invalidateToken(token: string, userId: string) {
    const key = this.key(userId, token);
    await this.redis.del(key);
  }

  async getRefreshToken(token: string, userId: string): Promise<string | null> {
    const key = this.key(userId, token);
    const result = await this.redis.get(key);
    return result ?? null;
  }
  
}

export const authStore = new AuthStore();
