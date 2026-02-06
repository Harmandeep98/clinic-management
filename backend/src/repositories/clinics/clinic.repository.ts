import { PoolClient } from "pg";
import { AppError } from "../../shared/errors/app-errors";
import { clinicRegisterType } from "../../http/clinics/clinic.schemas";
import { generateId } from "../../shared/id/uuid";

class ClinicRepository {
  async findSlugsWithPrefix(
    client: PoolClient,
    baseSlug: string,
  ): Promise<string[]> {
    const res = await client.query(
      `SELECT slug FROM clinics WHERE slug LIKE $1 ORDER BY slug`,
      [`${baseSlug}%`],
    );
    return res.rows.map((row) => row.slug);
  }

  async getShortCode(client: PoolClient, clinicId: string): Promise<string> {
    const res = await client.query(
      `SELECT short_code FROM clinics WHERE id = $1 AND is_active = true`,
      [clinicId],
    );
    if (res.rowCount === 0) {
      throw new AppError("Clinic not found");
    }

    return res.rows[0].short_code;
  }

  async createClinicCounter(
    client: PoolClient,
    clinicId: string,
  ): Promise<void> {
    const insertQuery = `INSERT INTO clinic_counters (clinic_id, visit_seq, appointment_seq) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`;

    const values = [clinicId, 0, 0];

    await client.query(insertQuery, values);
  }

  async createClinc(
    client: PoolClient,
    clinicData: clinicRegisterType,
  ): Promise<{ clinicId: string } | null> {
    const clinicId = generateId();
    const values = [
      clinicId,
      clinicData.name,
      clinicData.displayName,
      clinicData.phoneNumber,
      clinicData.country,
      clinicData.state,
      clinicData.city,
      clinicData.addressLine,
      clinicData.postcode,
      "ACTIVE",
      clinicData.email,
      clinicData.shortCode,
      clinicData.clinicSlug,
      "UTC", // default timezone
    ];

    const insertQuery = `
      INSERT 
      INTO clinics 
      (id, name, display_name, phone_number, country, state, city, address_line, postcode, clinic_status, email, short_code, slug, timezone)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT DO NOTHING;
    `;

    const result = await client.query(insertQuery, values);

    if (result.rowCount === 0) {
      return null;
    }

    return { clinicId: clinicId };
  }
}

export const clinicRepo = new ClinicRepository();
