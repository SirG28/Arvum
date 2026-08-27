import type { OwnerPerformanceReport } from "../services/report.service";
import { Rating } from "@/components/ui/Rating";
import { BOOKING_STATUS_LABELS } from "@/features/bookings/lib/status-labels";

interface PerformanceReportProps {
  report: OwnerPerformanceReport;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Benefício "relatórios de desempenho" do Plano Premium (Context.md §8.21) — só dados que já
// existem (reservas e avaliações), sem contagem de visualizações (não há tracking de página no
// projeto).
export function PerformanceReport({ report }: PerformanceReportProps) {
  const statusEntries = Object.entries(report.bookingCountByStatus) as [
    keyof typeof BOOKING_STATUS_LABELS,
    number,
  ][];

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex justify-between border-b border-neutral-200 pb-2">
        <span className="text-neutral-500">Receita total (reservas pagas)</span>
        <span className="font-medium text-neutral-900">{formatBRL(report.totalRevenueInCents)}</span>
      </div>

      <div>
        <p className="text-neutral-500">Reservas por status</p>
        {statusEntries.length === 0 ? (
          <p className="mt-1 text-neutral-400">Nenhuma reserva ainda.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1">
            {statusEntries.map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-neutral-600">{BOOKING_STATUS_LABELS[status] ?? status}</span>
                <span className="text-neutral-900">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
        <span className="text-neutral-500">Nota média recebida</span>
        {report.averageRating !== null ? (
          <div className="flex items-center gap-1.5">
            <Rating value={report.averageRating} size="sm" />
            <span className="text-neutral-900">
              {report.averageRating.toLocaleString("pt-BR")} ({report.reviewCount})
            </span>
          </div>
        ) : (
          <span className="text-neutral-400">Ainda sem avaliações</span>
        )}
      </div>
    </div>
  );
}
