import { z } from "zod";
import { LogisticsMode } from "@prisma/client";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const bookingRequestSchema = z
  .object({
    destinationPropertyId: z.string().trim().min(1, "Selecione a propriedade de destino."),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    logisticsMode: z.nativeEnum(LogisticsMode, {
      required_error: "Selecione como a máquina será retirada ou entregue.",
      invalid_type_error: "Selecione como a máquina será retirada ou entregue.",
    }),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "A data final deve ser posterior à inicial.",
    path: ["endDate"],
  })
  .refine((data) => data.startDate >= startOfToday(), {
    message: "Não é possível reservar datas passadas.",
    path: ["startDate"],
  });

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const bookingDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Selecione aprovar ou recusar.",
    invalid_type_error: "Selecione aprovar ou recusar.",
  }),
  reason: z.string().trim().max(500, "Motivo muito longo.").optional(),
});

export type BookingDecisionInput = z.infer<typeof bookingDecisionSchema>;

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
