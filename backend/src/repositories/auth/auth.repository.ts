import { query } from "../../infrastructure/db/query";
import { generateId } from "../../shared/id/uuid";
import { refreshTokenRow, userRefereshToken } from "./auth.types";

class AuthRepository {
  async saveRefershTokenToDB(tokenData: userRefereshToken): Promise<refreshTokenRow | null> {
    const insertQuery = `
      INSERT 
        INTO user_refresh_tokens 
          (id, token_hash, user_id, user_type, is_revoked) 
          VALUES ($1, $2, $3, $4, $5)
        ON CONFLIC (id) DO NOTHING
    `
    const values = [generateId(), tokenData.tokenHash, tokenData.userId, tokenData.userType, false];
    
    const result = await query<refreshTokenRow>(insertQuery, values);

    return result[0] ?? null;
  }

  async revokeRefereshToken(userId: string, token: string): Promise<void> {
    const updateQuery = `
      UPDATE user_refresh_tokens
      SET
        is_revoked = true
      WHERE
        user_id = $1 AND token_hash = $2 is_revoked = false
    `
    const values = [userId, token]

    await query(updateQuery, values)
  }

  async getRefereshToken(userId: string, token: string): Promise<refreshTokenRow | null> {
    const updateQuery = `
      SELECT token_hash, user_id, user_type
      FROM users
      WHERE
        user_id = $1 AND token_hash = $2 is_revoked = false
    `
    const values = [userId, token]

    const result = await query<refreshTokenRow>(updateQuery, values);

    return result[0] ?? null
  }
}

export const authRepository = new AuthRepository();