import { PoolClient } from "pg";
import { getDbPool } from "./pool";

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
