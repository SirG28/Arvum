"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MachineStatus } from "@prisma/client";
import { useChangeMachineStatus } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_BADGE_TONE } from "../lib/status-labels";

type ActionVariant = "primary" | "secondary";

const ACTIONS: Partial<Record<MachineStatus, { label: string; target: MachineStatus; variant?: ActionVariant }[]>> = {
  DRAFT: [{ label: "Publicar anúncio", target: "ACTIVE" }],
  ACTIVE: [{ label: "Pausar anúncio", target: "PAUSED", variant: "secondary" }],
  UNAVAILABLE: [
    { label: "Reativar anúncio", target: "ACTIVE" },
    { label: "Pausar anúncio", target: "PAUSED", variant: "secondary" },
  ],
  PAUSED: [{ label: "Reativar anúncio", target: "ACTIVE" }],
};

const ARCHIVABLE: MachineStatus[] = [
  "DRAFT",
  "ACTIVE",
  "UNAVAILABLE",
  "PAUSED",
  "PENDING_REVIEW",
  "REJECTED",
];

interface MachineStatusActionsProps {
  machineId: string;
  status: MachineStatus;
}

export function MachineStatusActions({ machineId, status }: MachineStatusActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const mutation = useChangeMachineStatus(machineId);

  async function handleChange(target: MachineStatus) {
    setError(null);
    try {
      await mutation.mutateAsync(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  const actions = ACTIONS[status] ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500">Status atual:</span>
        <Badge tone={STATUS_BADGE_TONE[status]}>{STATUS_LABELS[status]}</Badge>
      </div>
      {error && <Alert tone="error" title={error} />}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.target}
            variant={action.variant ?? "primary"}
            isLoading={mutation.isPending}
            onClick={() => handleChange(action.target)}
          >
            {action.label}
          </Button>
        ))}
        {ARCHIVABLE.includes(status) && (
          <Button
            variant="danger"
            isLoading={mutation.isPending}
            onClick={() => handleChange("ARCHIVED")}
          >
            Arquivar anúncio
          </Button>
        )}
      </div>
    </div>
  );
}
