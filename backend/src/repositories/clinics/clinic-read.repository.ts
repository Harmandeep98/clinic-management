import { PoolClient } from "pg";
import { AppError } from "../../shared/errors/app-errors";

class ClinicReadRepository {
  async getShortCode(client: PoolClient, clinicId: string): Promise<string> {
    const res = await client.query(
      `SELECT short_code FROM clinics WHERE id = $1`,
      [clinicId],
    );
    if (res.rowCount === 0) {
      throw new AppError("Clinic not found");
    }

    return res.rows[0].short_code;
  }
}

export const clinicRepo = new ClinicReadRepository();
