import { AppConfig } from "./config.types.js";

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Missing required environment variables: ${name}`);
  }

  return value;
}

export function loadConfig(): AppConfig {
  const env = getEnv("NODE_ENV", "development");
  const dbPort = parseInt(getEnv("DB_PORT", "5432"), 10);

  const ssl = getEnv("DB_SSL", "false") === "true";
  const redisPort = parseInt(getEnv("REDIS_PORT", "6379"), 10);

  if (Number.isNaN(dbPort)) {
    throw new Error("DB PORT must be a number");
  }

  if (Number.isNaN(redisPort)) {
    throw new Error("REDIS PORT must be a number");
  }

  return {
    env: env as AppConfig["env"],
    port: Number(getEnv("PORT", "3000")),
    db: {
      ssl: ssl,
      connectionUri: getEnv("DATABASE_URL", ""),
    },
    redis: {
      host: getEnv("REDIS_HOST", "127.0.0.1"),
      port: redisPort,
      password: getEnv("REDIS_PASSWORD", ""),
    },
    jwt: {
      secret: getEnv("JWT_SECRET", ""),
      verify: {
        allowedAud: "clinic-api",
        allowedIss: "clinic-app",
      },
    },
  };
}
