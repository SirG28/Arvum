import type { MachineStatus } from "@prisma/client";

export const STATUS_LABELS: Record<MachineStatus, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando análise",
  ACTIVE: "Ativo",
  UNAVAILABLE: "Indisponível",
  PAUSED: "Pausado",
  REJECTED: "Recusado",
  ARCHIVED: "Arquivado",
};

export const STATUS_BADGE_TONE: Record<
  MachineStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "info",
  ACTIVE: "success",
  UNAVAILABLE: "warning",
  PAUSED: "warning",
  REJECTED: "danger",
  ARCHIVED: "neutral",
};
