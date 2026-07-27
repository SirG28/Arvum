import type { MachineStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Record<MachineStatus, MachineStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  PENDING_REVIEW: ["ARCHIVED"],
  ACTIVE: ["PAUSED", "UNAVAILABLE", "ARCHIVED"],
  UNAVAILABLE: ["ACTIVE", "PAUSED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionMachineStatus(from: MachineStatus, to: MachineStatus) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
