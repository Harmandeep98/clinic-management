import { Pool } from "pg";

let pool: Pool | null = null;

type DB_CONFIG = {
  ssl: boolean;
  connectionUri: string;
};

export function createDbPool(config: DB_CONFIG) {
  console.log(config.connectionUri);
  pool = new Pool({
    connectionString: config.connectionUri,
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
