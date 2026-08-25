"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteProperty } from "../hooks/useProperties";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";

// Mesmo padrão de confirmação usado em toda ação destrutiva do app (CancelBookingButton,
// DeactivateAccountButton) — pop-up (ConfirmationDialog), nunca um estado inline substituindo o
// botão, para não haver dois comportamentos diferentes de "confirmar exclusão" na mesma aplicação.
export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteProperty();

  async function handleConfirm() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(propertyId);
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <Alert tone="error" title={error} />}
      <IconButton
        icon={<TrashIcon />}
        label="Remover propriedade"
        variant="danger"
        onClick={() => setConfirmOpen(true)}
      />
      <ConfirmationDialog
        open={confirmOpen}
        title="Remover esta propriedade?"
        description="Essa ação não pode ser desfeita. A remoção só é permitida quando não há máquinas cadastradas nesta propriedade."
        confirmLabel="Sim, remover propriedade"
        cancelLabel="Cancelar"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
