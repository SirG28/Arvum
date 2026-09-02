"use client";

import { useEffect, useState } from "react";
import type { BookingStatusHistory } from "@prisma/client";
import { BOOKING_STATUS_LABELS } from "../lib/status-labels";
import { consumeBookingJustAdvanced } from "../lib/timeline-highlight";
import { cn } from "@/lib/cn";

type StatusHistoryEntry = Pick<BookingStatusHistory, "id" | "nextStatus" | "createdAt">;

interface BookingStatusTimelineProps {
  bookingId: string;
  statusHistory: StatusHistoryEntry[];
}

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Lista de andamento compartilhada por /alugueis/[id] (locatário) e /alugueis/recebidos/[id]
// (proprietário) — os dois mostravam exatamente o mesmo `<ol>`. Extraído aqui também para
// carregar a lógica de destaque (MOTION.md, Etapa 5): se esta página acabou de ser recarregada
// por causa de uma ação do próprio usuário (ver timeline-highlight.ts), a última entrada — sempre
// a mais recente, `statusHistory` vem ordenado por `createdAt asc` — ganha um breve destaque, em
// vez de animar em toda visita ao aluguel (o que seria decorativo, não funcional).
export function BookingStatusTimeline({ bookingId, statusHistory }: BookingStatusTimelineProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // `router.refresh()` (usado por todas as ações de aluguel) não desmonta este componente — só
  // atualiza `statusHistory` com props novas. Por isso a dependência é o tamanho da lista, não
  // "só na montagem": é o crescimento da lista que sinaliza uma nova transição para conferir,
  // tanto na primeira renderização quanto depois de um refresh.
  useEffect(() => {
    const lastEntry = statusHistory[statusHistory.length - 1];
    if (lastEntry && consumeBookingJustAdvanced(bookingId)) {
      setHighlightedId(lastEntry.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusHistory.length, bookingId]);

  return (
    <ol className="mt-3 flex flex-col gap-3 text-sm">
      {statusHistory.map((entry) => (
        <li
          key={entry.id}
          className={cn(
            "flex justify-between gap-4 rounded-md px-2 py-1 -mx-2",
            entry.id === highlightedId && "animate-status-highlight",
          )}
        >
          <span className="text-neutral-900">{BOOKING_STATUS_LABELS[entry.nextStatus]}</span>
          <span className="shrink-0 text-neutral-400">{formatDateTime(entry.createdAt)}</span>
        </li>
      ))}
    </ol>
  );
}
