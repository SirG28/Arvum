import type { BookingStatus, LogisticsMode } from "@prisma/client";

// Ações possíveis de acompanhamento pós-pagamento (Context.md §8.9: TRANSPORT_SCHEDULED →
// IN_TRANSIT → DELIVERED → IN_USE → AWAITING_RETURN → RETURNED → COMPLETED). Retirada pelo
// locatário (RENTER_PICKUP) pula o rastreio de transporte — não existe "agendar"/"em trânsito"
// quando o próprio locatário busca a máquina — e usa CONFIRM_PICKUP em vez de CONFIRM_DELIVERY.
export type FulfillmentAction =
  | "SCHEDULE_TRANSPORT"
  | "START_TRANSIT"
  | "CONFIRM_DELIVERY"
  | "CONFIRM_PICKUP"
  | "START_RETURN"
  | "CONFIRM_RETURN";

export type FulfillmentActor = "OWNER" | "RENTER";

export interface FulfillmentActionInfo {
  action: FulfillmentAction;
  actor: FulfillmentActor;
  label: string;
  description: string;
}

// Única fonte de verdade de "qual é a próxima ação e de quem" (Context.md §8.9: cada transição
// possui regra e responsável) — usada tanto para validar a transição no servidor quanto para
// decidir, na interface, qual botão mostrar a cada lado da reserva. Sem dependência do Prisma
// client, para poder ser testada isoladamente e importada por componentes client.
export function getNextFulfillmentAction(
  status: BookingStatus,
  logisticsMode: LogisticsMode,
): FulfillmentActionInfo | null {
  switch (status) {
    case "PAYMENT_CONFIRMED":
      return logisticsMode === "RENTER_PICKUP"
        ? {
            action: "CONFIRM_PICKUP",
            actor: "RENTER",
            label: "Confirmar retirada da máquina",
            description: "Confirme quando você retirar a máquina na propriedade do proprietário.",
          }
        : {
            action: "SCHEDULE_TRANSPORT",
            actor: "OWNER",
            label: "Agendar transporte",
            description: "Registre que o transporte da máquina até o destino foi agendado.",
          };
    case "TRANSPORT_SCHEDULED":
      return {
        action: "START_TRANSIT",
        actor: "OWNER",
        label: "Iniciar transporte",
        description: "Registre que a máquina saiu para o destino combinado.",
      };
    case "IN_TRANSIT":
      return {
        action: "CONFIRM_DELIVERY",
        actor: "OWNER",
        label: "Confirmar entrega",
        description: "Confirme quando a máquina for entregue ao locatário no destino.",
      };
    case "IN_USE":
      return {
        action: "START_RETURN",
        actor: "RENTER",
        label: "Sinalizar devolução",
        description: "Avise que o uso terminou e a máquina será devolvida ao proprietário.",
      };
    case "AWAITING_RETURN":
      return {
        action: "CONFIRM_RETURN",
        actor: "OWNER",
        label: "Confirmar devolução",
        description: "Confirme quando receber a máquina de volta para concluir a reserva.",
      };
    default:
      return null;
  }
}

interface FulfillmentStep {
  nextStatus: BookingStatus;
  notes: string;
}

// Duas ações avançam dois estados de uma vez (mesma transação, dois registros de histórico): uma
// entrega/retirada confirmada já significa "em uso" no mesmo instante, e uma devolução confirmada
// já encerra a reserva — não há, no MVP, uma etapa intermediária que a plataforma consiga detectar
// sozinha entre esses pares de estados (Context.md §27: escolher a alternativa mais simples e
// registrar a decisão).
export const FULFILLMENT_STEPS: Record<FulfillmentAction, readonly FulfillmentStep[]> = {
  SCHEDULE_TRANSPORT: [
    { nextStatus: "TRANSPORT_SCHEDULED", notes: "Transporte agendado pelo proprietário." },
  ],
  START_TRANSIT: [{ nextStatus: "IN_TRANSIT", notes: "Transporte iniciado pelo proprietário." }],
  CONFIRM_DELIVERY: [
    { nextStatus: "DELIVERED", notes: "Entrega confirmada pelo proprietário." },
    { nextStatus: "IN_USE", notes: "Máquina em uso pelo locatário." },
  ],
  CONFIRM_PICKUP: [
    { nextStatus: "DELIVERED", notes: "Retirada confirmada pelo locatário." },
    { nextStatus: "IN_USE", notes: "Máquina em uso pelo locatário." },
  ],
  START_RETURN: [
    { nextStatus: "AWAITING_RETURN", notes: "Locatário sinalizou o início da devolução." },
  ],
  CONFIRM_RETURN: [
    { nextStatus: "RETURNED", notes: "Devolução confirmada pelo proprietário." },
    { nextStatus: "COMPLETED", notes: "Reserva concluída." },
  ],
};
