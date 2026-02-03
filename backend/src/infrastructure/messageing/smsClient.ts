import { loadConfig } from "../../config/index";
import { httpClient } from "../http/httpClinet";

interface SmsApiResponse {
  type: string;
  message: string;
  request_id?: string;
}

class SMSClient {
  private config = loadConfig().messageing;
  async sendSms(recipients: object[]) {
    const options = {
      headers: {
        accept: "application/json",
        authkey: this.config.authKey,
      },
    };

    const messageObject = {
      short_url: 0,
      template_id: "698211cba2cdd74c4d380547",
      recipients: recipients,
    };
    console.log(messageObject)
    const result = await httpClient.post<SmsApiResponse>(
      "https://control.msg91.com/api/v5/flow",
      messageObject,
      options,
    );
    return result;
  }
}

export const smsClient = new SMSClient();
