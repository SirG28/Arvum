import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PriceBreakdownProps {
  rentalValueInCents: number;
  logisticsValueInCents: number;
  serviceFeeInCents: number;
  depositInCents: number;
  discountInCents: number;
  totalValueInCents: number;
  distanceKm?: number | null;
  footnote?: ReactNode;
  className?: string;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Composição transparente do valor da locação (Context.md §8.12) — usada tanto na prévia antes de
// confirmar a reserva quanto no detalhe da reserva já criada, para os dois lugares sempre
// mostrarem os valores exatamente da mesma forma.
export function PriceBreakdown({
  rentalValueInCents,
  logisticsValueInCents,
  serviceFeeInCents,
  depositInCents,
  discountInCents,
  totalValueInCents,
  distanceKm,
  footnote,
  className,
}: PriceBreakdownProps) {
  return (
    <div className={cn("flex flex-col gap-2 text-sm", className)}>
      <dl className="flex flex-col gap-2">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Locação</dt>
          <dd className="text-neutral-900">{formatBRL(rentalValueInCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">
            Logística
            {distanceKm != null && (
              <span className="block text-xs text-neutral-400">
                Estimativa para {distanceKm.toLocaleString("pt-BR")} km
              </span>
            )}
          </dt>
          <dd className="text-neutral-900">{formatBRL(logisticsValueInCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Taxa de serviço</dt>
          <dd className="text-neutral-900">{formatBRL(serviceFeeInCents)}</dd>
        </div>
        {depositInCents > 0 && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">Caução</dt>
            <dd className="text-neutral-900">{formatBRL(depositInCents)}</dd>
          </div>
        )}
        {discountInCents > 0 && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">Desconto</dt>
            <dd className="text-neutral-900">-{formatBRL(discountInCents)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-neutral-200 pt-2 font-medium">
          <dt className="text-neutral-900">Total</dt>
          <dd className="text-primary-700">{formatBRL(totalValueInCents)}</dd>
        </div>
      </dl>
      {footnote && <p className="text-xs text-neutral-500">{footnote}</p>}
    </div>
  );
}
