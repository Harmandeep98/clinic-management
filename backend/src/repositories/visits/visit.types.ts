export type VisitRow = {
  id: string;
  clinic_id: string;
  appopintment_id: string;
  patient_id: string;
  doctor_id: string;
  visit_status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  started_at: Date;
  completed_at: Date | null;
  completed_by: string | null;
  visit_ref: string;
  notes: string | null;
};

export type visitWhere = {
  patient_id?: string;
  doctor_id?: string;
  clinic_id?: string;
};
