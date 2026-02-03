import { PoolClient } from "pg";
import {
  patientRegisterType,
  userRegisterType,
} from "../../http/users/user.schemas";
import { query } from "../../infrastructure/db/query";
import { UserType, UserWhere } from "./users.types";

class UserRepository {
  async createOrUpdateUser(client: PoolClient, userData: userRegisterType) {
    const values = [userData.id];
    let conditional = "";
    if (userData.phoneNumber) {
      conditional = "phone_number";
      values.push(userData.phoneNumber);
    } else if (userData.email) {
      conditional = "email";
      values.push(userData.email);
    }
    const insertQuery = `INSERT INTO
      users (id, ${conditional}, is_active)
      VALUES ($1, $2, true)
      ON CONFLICT (id) DO UPDATE SET
        ${conditional} = EXCLUDED.${conditional},
        is_active = true
    `;

    await client.query(insertQuery, values);
  }
}

export const userRepository = new UserRepository();

class PatientRepository {
  private assertSingleFilter(where: UserWhere) {
    const active = Object.values(where).filter(Boolean).length;
    if (active !== 1) {
      throw new Error("Exactly one visit filter must be provided");
    }
  }

  async checkPatientUserExists(
    phone_number: string,
    client?: PoolClient,
  ): Promise<boolean> {
    const sql = `
      SELECT EXISTS (
        SELECT 1
        FROM users
        WHERE phone_number = $1
          AND is_active = true
      ) as exists
    `;

    if (client) {
      const result = await client.query<{ exists: boolean }>(sql, [
        phone_number,
      ]);
      return result.rows[0]?.exists ?? false;
    } else {
      const result = await query<{ exists: boolean }>(sql, [phone_number]);
      return result[0]?.exists ?? false;
    }
  }

  async getPatientUser(
    phoneNumber: string,
  ): Promise<{ userId: string; patientId?: string } | null> {
    const selectQuery = `
      SELECT u.id AS user_id,
        p.id AS patient_id
        FROM users u
          LEFT JOIN patients p ON p.id = u.id
          AND p.is_active = true
        WHERE u.phone_number = $1 AND u.is_active = true
        ORDER BY u.created_at DESC
        LIMIT 1;
    `;
    const rows = await query<{ user_id: string; patient_id?: string }>(
      selectQuery,
      [phoneNumber],
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      userId: rows[0].user_id,
      patientId: rows[0].patient_id,
    };
  }

  async createOrUpdatePatient(
    client: PoolClient,
    patientData: patientRegisterType,
  ): Promise<void> {
    const insertQuery = `INSERT INTO
      patients (id, full_name, dob, gender, phone_number, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        dob = EXCLUDED.dob,
        gender = EXCLUDED.gender,
        phone_number = EXCLUDED.phone_number,
        is_active = true
    `;

    const values = [
      patientData.id,
      patientData.fullName,
      patientData.dob,
      patientData.gender,
      patientData.phoneNumber,
      true,
    ];
    console.log(patientData);
    await client.query(insertQuery, values);
  }

  async getUserContext(
    where: UserWhere,
    type: UserType,
  ): Promise<object | null> {
    this.assertSingleFilter(where);

    const conditions = [];
    let paramsIndex = 1;
    const values = [];

    let joinClause = "";

    if (where.phoneNumber) {
      conditions.push(`u.phone_number = $${paramsIndex++}`);
      values.push(where.phoneNumber);
    }

    if (where.email) {
      conditions.push(`u.email = $${paramsIndex++}`);
      values.push(where.email);
    }

    if (where.userId) {
      conditions.push(`u.id = $${paramsIndex++}`);
      values.push(where.userId);
    }

    if (type === "PATIENT") {
      joinClause = `INNER JOIN patients p ON p.user_id = u.id AND p.is_active = true`;
    } else if (type === "CLINIC") {
      joinClause = `INNER JOIN user_clinic_roles ucr on p.user_id = u.id AND ucr.is_active = true`;
    }

    const user = await query(
      `
        SELECT
          u.id,
          u.phone_number,
          u.email,

          -- patient
          p.id AS patient_id,

          -- clinic role
          ucr.clinic_id,
          ucr.user_role AS clinic_role,

          -- clinic details
          c.display_name AS clinic_display_name,
          c.address_line AS clinic_address,

        FROM users u

        LEFT JOIN patients p
          ON p.user_id = u.id
        AND p.is_active = true

        LEFT JOIN user_clinic_roles ucr
          ON ucr.user_id = u.id
        AND ucr.is_active = true

        LEFT JOIN clinics c
          ON c.id = ucr.clinic_id

        WHERE ${conditions.join(" AND ")}
        LIMIT 1
  `,
      values,
    );

    return user[0] ?? null;
  }
}

export const patientRepository = new PatientRepository();
