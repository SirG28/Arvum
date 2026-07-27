"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteMachine } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function DeleteMachineButton({ machineId }: { machineId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const deleteMutation = useDeleteMachine();

  async function handleConfirm() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(machineId);
      router.push("/maquinas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-start gap-2">
        {error && <Alert tone="error" title={error} />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleConfirm}>
            Confirmar remoção
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      Remover máquina definitivamente
    </Button>
  );
}
