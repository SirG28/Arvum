import { z } from "zod";

// Comunicação por aluguel (Context.md §8.15) — versão estruturada, sem chat completo: só o corpo
// da mensagem, sem anexos, edição ou reações.
export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Escreva uma mensagem antes de enviar.")
    .max(1000, "A mensagem deve ter no máximo 1000 caracteres."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
