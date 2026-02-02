import z from "zod";

export const patientLoginSchema = z.object({
  phoneNumber: z.string(),
});

export type patientLoginType = z.infer<typeof patientLoginSchema>;

export const patientOtpVerifySchema = z.object({
  phoneNumber: z.string(),
  otp: z.string(),
});
