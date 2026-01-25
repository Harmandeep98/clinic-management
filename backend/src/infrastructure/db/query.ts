import { QueryResultRow } from "pg";
import { getDbPool } from "./pool";

export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool();
  const result = await pool.query<T>(text, params);
  return result.rows;
}
