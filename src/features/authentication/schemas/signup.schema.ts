import { z } from "zod";
import { emailSchema, strongPasswordSchema } from "@/schemas/common.schema";

export const signupSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: emailSchema,
  password: strongPasswordSchema,
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  acceptedTerms: z
    .string()
    .optional()
    .refine((value) => value === "on", "É necessário aceitar os termos de uso."),
});

export type SignupInput = z.infer<typeof signupSchema>;
