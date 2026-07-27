import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

export const strongPasswordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.");
