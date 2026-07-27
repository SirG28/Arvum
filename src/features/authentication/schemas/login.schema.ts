import { z } from "zod";
import { emailSchema } from "@/schemas/common.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
