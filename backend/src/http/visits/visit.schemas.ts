import { z } from "zod";

export const StartVisitSchema = z.object({
  clinic_id: z.string().uuidv7(),
  appointment_id: z.string().uuidv7(),
  patient_id: z.string().uuidv7(),
  doctor_id: z.string().uuidv7(),
  visit_ref: z.string().min(1),
  notes: z.string().optional(),
});

export type StartVisitRequest = z.infer<typeof StartVisitSchema>;

export const CompleteVisitSchema = z.object({
  visit_id: z.string().uuidv7(),
});

export type CompleteVisitRequest = z.infer<typeof CompleteVisitSchema>;
