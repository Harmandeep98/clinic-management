import z from "zod";

export const authSchema = z.object({
  phone_number: z.string().optional(),
  email: z.email().optional(),
});

export type authType = z.infer<typeof authSchema>;
