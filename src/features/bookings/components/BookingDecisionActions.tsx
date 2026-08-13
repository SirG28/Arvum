"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { useDecideBooking } from "../hooks/useBookings";

// Ações do proprietário sobre uma solicitação aguardando aprovação (Context.md §8.8) — aprovar
// não precisa de justificativa, recusar aceita um motivo opcional que fica registrado no
// histórico da reserva (BookingStatusHistory), visível ao locatário.
export function BookingDecisionActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useDecideBooking(bookingId);

  async function decide(decision: "APPROVED" | "REJECTED") {
    setError(null);
    try {
      await mutation.mutateAsync({ decision, reason: decision === "REJECTED" ? reason : undefined });
      setApproveOpen(false);
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setApproveOpen(true)}>Aprovar solicitação</Button>
        <Button variant="danger" onClick={() => setRejectOpen(true)}>
          Recusar solicitação
        </Button>
      </div>

      <ConfirmationDialog
        open={approveOpen}
        title="Aprovar esta solicitação?"
        description="O locatário será informado que a reserva foi aprovada e o período fica bloqueado para outras solicitações."
        confirmLabel="Sim, aprovar"
        cancelLabel="Voltar"
        tone="primary"
        isLoading={mutation.isPending}
        onConfirm={() => decide("APPROVED")}
        onCancel={() => setApproveOpen(false)}
      />

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Recusar esta solicitação?">
        <p className="text-sm text-neutral-700">
          O locatário será informado que a reserva foi recusada. Você pode explicar o motivo — isso
          fica registrado no andamento da reserva.
        </p>
        <label className="mt-4 block text-sm font-medium text-neutral-900" htmlFor="reject-reason">
          Motivo (opcional)
        </label>
        <Textarea
          id="reject-reason"
          className="mt-1"
          rows={3}
          placeholder="Ex.: máquina em manutenção nesse período."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)} disabled={mutation.isPending}>
            Voltar
          </Button>
          <Button type="button" variant="danger" isLoading={mutation.isPending} onClick={() => decide("REJECTED")}>
            Sim, recusar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
