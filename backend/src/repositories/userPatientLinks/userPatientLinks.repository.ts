import { PoolClient } from "pg";
import { query } from "../../infrastructure/db/query";
import { generateId } from "../../shared/id/uuid";

export class UserPatientLinks {
  async existsActiveLink(userId: string, patientId: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1
        FROM user_patient_links
        WHERE user_id = $1
          AND patient_id = $2
          AND is_active = true
      ) AS exists`,
      [userId, patientId],
    );
    return result[0]?.exists ?? false;
  }

  async createUserPatientLink(
    client: PoolClient,
    userId: string,
    patientId: string,
  ): Promise<void> {
    await client.query(
      `
      INSERT INTO user_patient_links (id, user_id, patient_id, is_active)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (user_id, patient_id)
      DO NOTHING
      `,
      [generateId(), userId, patientId],
    );
  }
}

export const UserPatientLinksRepository = new UserPatientLinks();
