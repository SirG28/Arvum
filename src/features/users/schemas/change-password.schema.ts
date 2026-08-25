import { z } from "zod";
import { strongPasswordSchema } from "@/schemas/common.schema";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
