import { Pool } from "pg";

let pool: Pool | null = null;

type DB_CONFIG = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  ssl: boolean;
};

export function createDbPool(config: DB_CONFIG) {
  pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return pool;
}

export function getDbPool(): Pool {
  if (!pool) {
    throw new Error("DB pool not intialized");
  }

  return pool;
}

export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
