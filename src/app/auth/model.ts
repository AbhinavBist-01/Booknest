import z from "zod";

export const signUpPayload = z.object({
  first_name: z.string().min(2),
  last_name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signInPayload = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
