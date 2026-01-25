import { loadConfig } from "./config/index";
import { closeDbPool, createDbPool } from "./infrastructure/db/pool";
import {
  closeRedisConnection,
  createRedisClient,
} from "./infrastructure/redis/client";
import { createServer } from "./server";

async function bootStrap() {
  const config = loadConfig();
  const server = createServer();

  createDbPool(config.db);
  createRedisClient(config.redis);

  const shutDown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    try {
      await server.close();
      await closeDbPool();
      await closeRedisConnection();
      console.log(`✅ server closed cleanly`);
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error shutting down`, error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutDown);
  process.on("SIGINT", shutDown);

  try {
    await server.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    console.log(
      `🚀 Server started on port ${config.port} in ${config.env} environment. 😇`,
    );
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

bootStrap();
