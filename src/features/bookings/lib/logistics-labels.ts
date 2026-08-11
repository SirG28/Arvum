import type { LogisticsMode } from "@prisma/client";

export const LOGISTICS_MODE_LABELS: Record<LogisticsMode, string> = {
  RENTER_PICKUP: "Eu mesmo retiro a máquina",
  OWNER_DELIVERY: "Entrega pelo proprietário",
  PARTNER_TRANSPORT: "Transporte por parceiro",
};
