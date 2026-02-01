import { loadConfig } from "../../config/index";
import { httpClient } from "../http/httpClinet";

type recipients = {
  mobiles: string;
  VAR1: string;
}[];

class SMSClient {
  private config = loadConfig().messageing;
  async sendSms(recipients: recipients) {
    const options = {
      headers: {
        accept: "application/json",
        authkey: this.config.authKey,
      },
    };

    const messageObject = {
      short_url: 0,
      recipients: recipients,
    };

    const result = await httpClient.post(
      "https://control.msg91.com/api/v5/flow",
      messageObject,
      options,
    );

    return result;
  }
}

export const smsClient = new SMSClient();
