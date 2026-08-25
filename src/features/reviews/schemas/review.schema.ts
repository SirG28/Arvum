import { z } from "zod";

const ratingScale = z
  .number({ required_error: "Escolha uma nota de 1 a 5.", invalid_type_error: "Escolha uma nota de 1 a 5." })
  .int("A nota deve ser um número inteiro.")
  .min(1, "A nota deve ser de 1 a 5.")
  .max(5, "A nota deve ser de 1 a 5.");

// Só a nota geral é obrigatória (Context.md §8.14) — as notas por aspecto (estado do
// equipamento, comunicação, pontualidade, experiência logística) são opcionais, e o serviço
// decide quais fazem sentido para quem está avaliando (locatário avalia o equipamento e a
// logística; proprietário não).
export const reviewRequestSchema = z.object({
  rating: ratingScale,
  machineConditionRating: ratingScale.optional(),
  communicationRating: ratingScale.optional(),
  punctualityRating: ratingScale.optional(),
  logisticsRating: ratingScale.optional(),
  comment: z
    .string()
    .trim()
    .max(1000, "O comentário deve ter no máximo 1000 caracteres.")
    .optional(),
});

export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
