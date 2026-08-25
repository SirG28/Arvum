"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteProperty } from "../hooks/useProperties";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { Alert } from "@/components/ui/Alert";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const deleteMutation = useDeleteProperty();

  async function handleConfirm() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(propertyId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <Alert tone="error" title={error} />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleConfirm}>
            Confirmar exclusão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <IconButton
      icon={<TrashIcon />}
      label="Remover propriedade"
      variant="danger"
      onClick={() => setConfirming(true)}
    />
  );
}
