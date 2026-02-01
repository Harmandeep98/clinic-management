import { smsClient } from "../../infrastructure/messageing/smsClient.js";

class OtpSender {
  async sendOtp(
    otp: string,
    phoneNumber: string,
    otpType: OtpType,
  ): Promise<Object | null> {
    if (otpType === "PHONE") {
      const result = await this.sendSMSOtp(otp, phoneNumber);
      return result;
    } else {
      return null;
    }
  }

  private async sendSMSOtp(otp: string, phoneNumber: string) {
    try {
      const message = `Your Clinic Verification code is ${otp}. Please do not share it with anybody.`;
      const recipients = [{ mobiles: phoneNumber, VAR1: message }];
      await smsClient.sendSms(recipients);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const otpSender = new OtpSender();
