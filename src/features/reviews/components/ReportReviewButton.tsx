"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { useReportReview } from "../hooks/useReviews";

// Discreto de propósito (texto pequeno, sem ícone) — denunciar é uma ação rara e de baixa
// prioridade visual perto da avaliação em si, nunca competindo com ela por atenção.
export function ReportReviewButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useReportReview(reviewId);

  async function handleReport() {
    setError(null);
    try {
      await mutation.mutateAsync({ reason: reason || undefined });
      setOpen(false);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 block text-xs text-neutral-400 hover:text-danger-500 hover:underline"
      >
        Denunciar
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Denunciar esta avaliação?">
        <p className="text-sm text-neutral-700">
          Conte o que há de errado com este comentário — nossa equipe revisa antes de qualquer
          ação, a avaliação continua visível até lá.
        </p>
        {error && <Alert tone="error" title={error} className="mt-3" />}
        <label className="mt-4 block text-sm font-medium text-neutral-900" htmlFor="report-reason">
          Motivo (opcional)
        </label>
        <Textarea
          id="report-reason"
          className="mt-1"
          rows={3}
          placeholder="Ex.: linguagem ofensiva, informação falsa."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Voltar
          </Button>
          <Button type="button" variant="danger" isLoading={mutation.isPending} onClick={handleReport}>
            Enviar denúncia
          </Button>
        </div>
      </Modal>
    </>
  );
}
