import { getRedisClient } from "../../infrastructure/redis/client";
import { UserType } from "../../repositories/users/users.types";

type storeOtp = {
  attemps: number;
  hash: string;
};

class OtpStore {
  private _redis: ReturnType<typeof getRedisClient> | null = null;

  private get redis() {
    if (!this._redis) {
      this._redis = getRedisClient();
    }
    return this._redis;
  }

  private key(phoneNumber: string, type: UserType, clincId?: string) {
    let nuance = "";
    if (type === "PATIENT") {
      nuance = "patient";
    } else if (type === "CLINIC") {
      nuance = clincId as string;
    }
    return `otp:auth:${nuance}:${phoneNumber}`;
  }

  async storeOtp(
    data: storeOtp,
    phoneNumber: string,
    type: UserType,
    clincId?: string,
  ): Promise<Boolean> {
    const TTL_OTP = 180;
    const redisResult = await this.redis.set(
      this.key(phoneNumber, type, clincId),
      JSON.stringify(data),
      "EX",
      TTL_OTP,
    );

    return redisResult === "OK";
  }

  async getOtp(
    phoneNumber: string,
    type: UserType,
    clincId?: string,
  ): Promise<storeOtp | null> {
    const redisResult = await this.redis.get(
      this.key(phoneNumber, type, clincId),
    );
    if (!redisResult) return null;
    return JSON.parse(redisResult) as storeOtp;
  }

  async incrementOtpAttempts(
    phoneNumber: string,
    type: UserType,
    clincId?: string,
  ): Promise<number> {
    const existingData = await this.getOtp(phoneNumber, type, clincId);

    if (!existingData) return 0;
    const updated = { ...existingData, attemps: existingData.attemps + 1 };

    await this.redis.set(
      this.key(phoneNumber, type, clincId),
      JSON.stringify(updated),
      "KEEPTTL",
    );

    return updated.attemps;
  }

  async invalidateOtp(
    phoneNumber: string,
    type: UserType,
    clincId?: string,
  ): Promise<void> {
    await this.redis.del(this.key(phoneNumber, type, clincId));
  }
}

export const otpStore = new OtpStore();
