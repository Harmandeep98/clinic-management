export type AppConfig = {
  port: number;
  env: "development" | "production" | "test";

  db: {
    ssl: boolean;
    connectionUri: string;
  };

  redis: {
    host: string;
    port: number;
    password: string;
  };

  jwt: {
    secret: string;
    verify: {
      allowedAud: string;
      allowedIss: string;
    };
  };

  otpSecret: string;

  messageing: {
    authKey: string;
  };
};
