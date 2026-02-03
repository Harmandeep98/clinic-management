export type UserWhere = {
  phoneNumber?: string;
  email?: string;
  userId?: string;
};

export type UserType = "CLINIC" | "PATIENT"