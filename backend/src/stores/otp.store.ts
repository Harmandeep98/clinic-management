import { getRedisClient } from "../infrastructure/redis/client";

type storeOtp = {
  attemps: number;
  hash: string;
};

class OtpStore {
  private redis = getRedisClient();

  private key(phoneNumber: string) {
    return `otp:login:${phoneNumber}`;
  }

  async storeOtp(data: storeOtp, phoneNumber: string): Promise<Boolean> {
    const TTL_OTP = 180;
    const redisResult = await this.redis.set(
      this.key(phoneNumber),
      JSON.stringify(data),
      "EX",
      TTL_OTP,
      "NX",
    );

    return redisResult === "OK";
  }

  async getOtp(phoneNumber: string): Promise<storeOtp | null> {
    const redisResult = await this.redis.get(this.key(phoneNumber));
    if (!redisResult) return null;
    return JSON.parse(redisResult) as storeOtp;
  }

  async incrementOtpAttempts(phoneNumber: string): Promise<number> {
    const existingData = await this.getOtp(phoneNumber);

    if (!existingData) return 0;
    const updated = { ...existingData, attemps: existingData.attemps + 1 };

    await this.redis.set(
      this.key(phoneNumber),
      JSON.stringify(updated),
      "KEEPTTL",
    );

    return updated.attemps;
  }

  async invalidateOtp(phoneNumber: string): Promise<void> {
    await this.redis.del(this.key(phoneNumber));
  }
}

export const otpStore = new OtpStore();
