import { z } from "zod";
import { LogisticsMode } from "@prisma/client";

function startOfTomorrow() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export const bookingRequestSchema = z
  .object({
    destinationPropertyId: z.string().trim().min(1, "Selecione a propriedade de destino."),
    startDate: z.coerce.date({ errorMap: () => ({ message: "Selecione a data de início." }) }),
    endDate: z.coerce.date({ errorMap: () => ({ message: "Selecione a data final." }) }),
    logisticsMode: z.nativeEnum(LogisticsMode, {
      required_error: "Selecione como a máquina será retirada ou entregue.",
      invalid_type_error: "Selecione como a máquina será retirada ou entregue.",
    }),
    operationSupportIncluded: z.boolean().default(false),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "A data final deve ser posterior à inicial.",
    path: ["endDate"],
  })
  .refine((data) => data.startDate >= startOfTomorrow(), {
    message: "Não é possível alugar para hoje. Escolha uma data a partir de amanhã.",
    path: ["startDate"],
  });

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const fulfillmentActionSchema = z.object({
  action: z.enum(
    [
      "SCHEDULE_TRANSPORT",
      "START_TRANSIT",
      "CONFIRM_DELIVERY",
      "CONFIRM_PICKUP",
      "START_RETURN",
      "CONFIRM_RETURN",
    ],
    {
      required_error: "Ação inválida.",
      invalid_type_error: "Ação inválida.",
    },
  ),
});

export type FulfillmentActionInput = z.infer<typeof fulfillmentActionSchema>;
