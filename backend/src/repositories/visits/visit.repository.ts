import { PoolClient } from "pg";
import { VisitRow } from "./visit.types";
import { query } from "../../infrastructure/db/query";

export class VisitRepository {
  // Find visit By Appopintment ID
  async findByAppointmentId(id: string): Promise<VisitRow | null> {
    const findByIdQuery = `SELECT * FROM visits WHERE appointment_id = $1`;
    const rows = await query<VisitRow>(findByIdQuery, [id]);

    return rows[0] ?? null;
  }

  // Find visit By ID
  async findById(id: string): Promise<VisitRow | null> {
    const findByIdQuery = `SELECT * FROM visits WHERE id = $1`;
    const rows = await query<VisitRow>(findByIdQuery, [id]);

    return rows[0] ?? null;
  }

  // Find visit By Appopintment ID for update
  async findByAppointmentIdForUpdate(
    client: PoolClient,
    id: string,
  ): Promise<VisitRow | null> {
    const findByIdQuery = `SELECT * FROM visits WHERE appointment_id = $1`;
    const res = await client.query<VisitRow>(findByIdQuery, [id]);

    return res.rows[0] ?? null;
  }

  // Find visit By ID
  async findByIdForUpdate(
    client: PoolClient,
    id: string,
  ): Promise<VisitRow | null> {
    const findByIdQuery = `SELECT * FROM visits WHERE id = $1`;
    const res = await client.query<VisitRow>(findByIdQuery, [id]);

    return res.rows[0] ?? null;
  }

  // Find Visits By PatientId
  async findVsistsForPatient(
    searchFilter: {type: string, id: string},
    limit: number,
    cursor?: { started_at: string; id: string },
  ) {
    const values: any[] = [searchFilter.id, limit];

    let cursorClause = ``;

    if (cursor && cursor.id && cursor.started_at) {
      values.push(cursor.started_at, cursor.id);
      cursorClause = `AND (
        started_at < $3
        OR (started_at = $3 AND id < $4)
      )`;
    }

    const cursorQuery = `
        SELECT 
        id,
        visit_ref,
        clinic_id,
        doctor_id,
        visit_status,
        started_at,
        completed_at
        FROM visits 
        WHERE ${searchFilter.type} = $1 ${cursorClause} 
        ORDER BY started_at DESC, id DESC LIMIT $2`;

    const rows = await query<VisitRow>(cursorQuery, values);

    return rows;
  }

  // Create New visit with (transaction required)
  async create(
    client: PoolClient,
    data: {
      id: string;
      clinic_id: string;
      appointment_id: string;
      patient_id: string;
      doctor_id: string;
      visit_status: "IN_PROGRESS";
      started_at: Date;
      visit_ref: string;
      notes?: string | null;
    },
  ): Promise<void> {
    const writeVisistQuery = `INSERT INTO visits (
      id, 
      clinic_id,
      appointment_id,
      patient_id,
      doctor_id,
      visit_status,
      started_at,
      visit_ref,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)  
    `;

    await client.query(writeVisistQuery, [
      data.id,
      data.clinic_id,
      data.appointment_id,
      data.patient_id,
      data.doctor_id,
      data.visit_status,
      data.started_at,
      data.visit_ref,
      data.notes ?? null,
    ]);
  }

  // Mark visit as completed (transaction required)
  async markCompleted(
    client: PoolClient,
    visitId: string,
    completedAt: Date,
  ): Promise<void> {
    const markCompleteQuery = `
      UPDATE visits
      SET visit_status = 'COMPLETED',
          completed_at = $2
      WHERE id = $1
      `;
    await client.query(markCompleteQuery, [visitId, completedAt]);
  }
}
