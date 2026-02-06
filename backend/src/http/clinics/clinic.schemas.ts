import z from "zod";

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
  state: z.string({ error: "Please provide clinic's state." }),
  city: z.string({ error: "Please provide clinic's city." }),
  addressLine: z.string({ error: "Please provide clinic's address." }),
  postcode: z.string({ error: "Please provide clinic's state." }),
  adminName: z.string({ error: "Please provide user's state." }),
  email: z.string({ error: "Please enter clinic's email." }),
  adminRole: z.enum(["DOCTOR", "STAFF"], {
    error: "Please provide the valid role for user.",
  }),
  shortCode: z.string().optional(),
  clinicSlug: z.string().optional(),
});

export type clinicRegisterType = z.infer<typeof clinicRegisterSchema> & {
  shortCode: string;
  clincSlug: string;
};
