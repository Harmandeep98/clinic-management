import Redis from "ioredis";

let redis: Redis | null = null;

type RedisConfig = {
  host: string;
  port: number;
  password: string;
};

export function createRedisClient(config: RedisConfig) {
  redis = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });
}

export function getRedisClient(): Redis {
  if (!redis) {
    throw new Error("Redis client not intialized");
  }

  return redis;
}

export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("✅ Redis client closed");
  }
}
