"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";
import { useRequestDataDeletion } from "../hooks/useUsers";

interface DataDeletionRequestButtonProps {
  requestedAt: Date | null;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Registra a intenção (Context.md §19 — LGPD) sem apagar nada automaticamente: parte do histórico
// financeiro/de aluguéis pode precisar ser retida por obrigação legal (§9.1), então a exclusão de
// fato depende de triagem manual, ainda sem painel administrativo para isso (Fase 6).
export function DataDeletionRequestButton({ requestedAt }: DataDeletionRequestButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRequestedAt, setLocalRequestedAt] = useState(requestedAt);
  const mutation = useRequestDataDeletion();

  async function handleConfirm() {
    setError(null);
    try {
      const result = await mutation.mutateAsync();
      setLocalRequestedAt(result.dataDeletionRequestedAt);
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  if (localRequestedAt) {
    return (
      <Alert tone="info" title="Pedido registrado">
        Você solicitou a exclusão dos seus dados em {formatDate(localRequestedAt)}. Nossa equipe
        vai analisar o que pode ser removido e o que precisa ser retido por obrigação legal.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <Button variant="danger" className="self-start" onClick={() => setConfirmOpen(true)}>
        Solicitar exclusão dos meus dados
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Solicitar exclusão dos seus dados?"
        description="Vamos registrar seu pedido e analisar o que pode ser removido — parte do histórico financeiro e de aluguéis pode precisar ser mantida por obrigação legal. Isso não desativa sua conta automaticamente."
        confirmLabel="Sim, solicitar exclusão"
        cancelLabel="Voltar"
        tone="danger"
        isLoading={mutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
