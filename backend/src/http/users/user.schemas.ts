import { z } from "zod";

export const userRegistarionSchema = z.object({
  email: z.email().optional(),
  phoneNumber: z.string().optional(),
});

export type userRegisterType = z.infer<typeof userRegistarionSchema> & {
  id: string;
};

export const patientRegistarionSchema = z
  .object({
    fullName: z
      .string({ error: "Please provide patient's full name." })
      .min(3)
      .max(50),
    dob: z.string({ error: "Please provide patient's date of birth." }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      error: "Gender must be MALE, FEMALE, or OTHER",
    }),
  })
  .merge(userRegistarionSchema);

export type patientRegisterType = userRegisterType &
  z.infer<typeof patientRegistarionSchema>;

export const patientDisableSchema = z.object({
  isActive: z.boolean({ error: "Please add valid parameter." }),
});

export type patientDisabletype = z.infer<typeof patientDisableSchema>;
