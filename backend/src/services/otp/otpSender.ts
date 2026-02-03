import { smsClient } from "../../infrastructure/messageing/smsClient";

type recipients = {
  mobiles: string;
  otp: string;
}[];

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
      const recipients = [{ mobiles: phoneNumber, otp: otp }] as recipients;
      const result = await smsClient.sendSms(recipients);
      if (result.data && result.data.type === "error") {
        throw new Error(`SMS Service Failed: ${result.data.message}`);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const otpSender = new OtpSender();
