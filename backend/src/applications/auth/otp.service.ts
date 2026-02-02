import { UserType } from "../../repositories/users/user.types";
import { AppError } from "../../shared/errors/app-errors";
import { compareOtp, generateOtp, hashOtp } from "../../shared/otp/otp";
import { otpStore } from "../../stores/otp/otp.store";
import { otpSender } from "../../services/otp/otpSender";

class AuthOtpService {
  async sendAuthOtp(
    phoneNumber: string,
    type: UserType,
    clinc_id?: string,
  ): Promise<object> {
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    const result = await otpStore.storeOtp(
      { hash: hashedOtp, attemps: 0 },
      phoneNumber,
      type,
      clinc_id,
    );

    if (!result) {
      throw new AppError("OTP sending failed", 503, "OTP_SENDING_FAIL");
    }

    const sent = await otpSender.sendOtp(otp, phoneNumber, "PHONE");

    if (!sent) {
      throw new AppError("OTP delivery failed", 503, "OTP_SENDING_FAILED");
    }

    return {
      success: true,
      message: `We have sent verification code on ${phoneNumber}.`,
    };
  }

  async verifyOtp(
    otp: string,
    phoneNumber: string,
    type: UserType,
    clincId?: string,
  ) {
    const storedHash = await otpStore.getOtp(phoneNumber, type, clincId);

    if (!storedHash || storedHash.attemps == 3)
      throw new AppError(
        "Invalid verification code or this verification code is no longer valid",
        403,
        "INVALID_OTP",
      );

    const hashedOtp = hashOtp(otp);
    const isValid = compareOtp(hashedOtp, storedHash.hash);

    if (!isValid) {
      throw new AppError(
        "Invalid verification code or this verification code is no longer valid",
        403,
        "INVALID_OTP",
      );
    }

    return isValid;
  }
}

export const authOtpService = new AuthOtpService();
