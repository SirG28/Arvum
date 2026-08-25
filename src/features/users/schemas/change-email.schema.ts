import { z } from "zod";
import { emailSchema } from "@/schemas/common.schema";

export const changeEmailRequestSchema = z.object({
  newEmail: emailSchema,
  currentPassword: z.string().min(1, "Informe sua senha atual."),
});

export type ChangeEmailRequestInput = z.infer<typeof changeEmailRequestSchema>;

export const confirmEmailChangeSchema = z.object({
  token: z.string().min(1, "Token de confirmação ausente."),
});

export type ConfirmEmailChangeInput = z.infer<typeof confirmEmailChangeSchema>;
