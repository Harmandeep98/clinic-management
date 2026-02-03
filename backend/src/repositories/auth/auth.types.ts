import { UserType } from "../users/users.types";

export type userRefereshToken = {
  userId: string;
  tokenHash: string;
  userType: UserType;
};

export type refreshTokenRow = {
  id: string;
  token_hash: string;
  user_id: string;
  user_type: UserType;
  is_revoked: boolean;
};
