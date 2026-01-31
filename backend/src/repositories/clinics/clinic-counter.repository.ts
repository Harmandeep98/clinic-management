import { PoolClient } from "pg";

class ClinicCounterRepository {
  async incrementVisitSeq(
    client: PoolClient,
    clinicId: string,
  ): Promise<number> {
    const query = `
      INSERT INTO clinic_counters (clinic_id, visit_seq)
      VALUES ($1, 1)
      ON CONFLICT (clinic_id)
      DO UPDATE SET
        visit_seq = clinic_counters.visit_seq + 1,
        updated_at = now()
      RETURNING visit_seq
    `;

    const result = await client.query(query, [clinicId]);

    return result.rows[0].visit_seq;
  }
}

export const counterRepo = new ClinicCounterRepository();