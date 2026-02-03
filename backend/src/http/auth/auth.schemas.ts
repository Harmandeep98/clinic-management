import z from "zod";
import { UserType } from "../../repositories/users/users.types";

export const patientLoginSchema = z.object({
  phoneNumber: z.string(),
});

export type patientLoginType = z.infer<typeof patientLoginSchema>;

export const patientOtpVerifySchema = z.object({
  phoneNumber: z.string(),
  otp: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ error: "Please provide a valid refresh token." }),
});
