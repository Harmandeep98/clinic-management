import z from "zod";
import { UserType } from "../../repositories/users/user.types";

export const patientLoginSchema = z.object({
  phoneNumber: z.string(),
});

export type patientLoginType = z.infer<typeof patientLoginSchema>;

export const patientOtpVerifySchema = z.object({
  phoneNumber: z.string(),
  otp: z.string(),
});