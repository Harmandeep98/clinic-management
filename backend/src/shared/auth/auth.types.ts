export type Role = "ADMIN" | "DOCTOR" | "STAFF" | "PATIENT";
export type ClinicRole = "ADMIN" | "DOCTOR" | "STAFF";
export interface baseJwtPayload {
  role: Role;
  sub: string;
  iat?: number;
  exp?: number;
}

export interface patientJwtPayload extends baseJwtPayload {
  role: "PATIENT";
  pid?: string;
}

export interface clinicUserJwtPayload extends baseJwtPayload {
  role: ClinicRole;
  cid: string;
  doctor_id?: string;
}
