import { randomInt, timingSafeEqual } from "crypto";
import { createHmac } from "crypto";
import { loadConfig } from "../../config/index";

const config = loadConfig();

export function generateOtp(): string {
  return randomInt(10000, 100000).toString();
}

export function hashOtp(otp: string): string {
  return createHmac("sha256", config.otpSecret).update(otp).digest("hex");
}

export function compareOtp(otp: string, storedhash: string): boolean {
  const hashedOtp = hashOtp(otp);

  return timingSafeEqual(
    Buffer.from(hashedOtp, "hex"),
    Buffer.from(storedhash, "hex"),
  );
}
