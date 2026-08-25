"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteMachine } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";

// Mesmo padrão de confirmação usado em toda ação destrutiva do app — pop-up (ConfirmationDialog),
// nunca um estado inline substituindo o botão.
export function DeleteMachineButton({ machineId }: { machineId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteMachine();

  async function handleConfirm() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(machineId);
      router.push("/maquinas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <Alert tone="error" title={error} />}
      <Button variant="danger" onClick={() => setConfirmOpen(true)}>
        Remover máquina definitivamente
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Remover esta máquina definitivamente?"
        description="Essa ação não pode ser desfeita. A remoção só é permitida quando não há reservas ativas vinculadas a esta máquina."
        confirmLabel="Sim, remover máquina"
        cancelLabel="Cancelar"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
