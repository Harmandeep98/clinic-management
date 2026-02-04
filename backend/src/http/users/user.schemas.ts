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

export const clinicRegisterSchema = z.object({
  name: z.string({ error: "Please provide clinic's name." }).min(3).max(100),
  displayName: z
    .string({ error: "Please provide clinic's display name." })
    .min(3)
    .max(100),
  phoneNumber: z
    .string({ error: "Please provide clinic's phone number." })
    .regex(/^\+\d{1,4}$/, "Invalid country code format"),
  country: z.string({ error: "Please provide clinic's country." }).max(2),
  state: z.string({ error: "Please provide clinic's state" }),
  addressLine: z.string({ error: "Please provide clinic's address" }),
  postcode: z.string({ error: "Please provide clinic's state" }),
  adminName: z.string({ error: "Please provide clinic's state" }),
  shortCode: z.string().optional(),
  clinicSlug: z.string().optional(),
});

