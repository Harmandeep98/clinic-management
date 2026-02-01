import { AppError } from "../../shared/errors/app-errors.js";
import { compareOtp, generateOtp, hashOtp } from "../../shared/otp/otp.js";
import { otpStore } from "../../stores/otp.store.js";
import { otpSender } from "../otp/otpSender.js";

class AuthOtpService {
  async sendAuthOtp(phoneNumber: string): Promise<boolean | null> {
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    const result = await otpStore.storeOtp(
      { hash: hashedOtp, attemps: 0 },
      phoneNumber,
    );

    if (!result) {
      throw new AppError("OTP sending failed", 503, "OTP_SENDING_FAIL");
    }

    const sent = await otpSender.sendOtp(otp, phoneNumber, "PHONE");

    if (!sent) {
      throw new AppError("OTP delivery failed", 503, "OTP_SENDING_FAILED");
    }

    return true;
  }

  async verifyOtp(otp: string, phoneNumber: string) {
    const storedHash = await otpStore.getOtp(phoneNumber);

    if (!storedHash || storedHash.attemps == 3)
      throw new AppError(
        "This verification code is no longer valid",
        403,
        "INVALID_OTP",
      );

    const hashedOtp = hashOtp(otp);
    const isValid = compareOtp(hashedOtp, storedHash.hash);

    if (!isValid) {
      throw new AppError(
        "This verification code is no longer valid",
        403,
        "INVALID_OTP",
      );
    }

    return true;
  }
}

const authOtpService = new AuthOtpService();
