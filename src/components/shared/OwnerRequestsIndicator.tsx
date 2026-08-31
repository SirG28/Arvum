"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useOwnerPendingCount } from "@/features/bookings/hooks/useBookings";

// Equivalente do lado do proprietário ao ReservationsIndicator: solicitações aguardando decisão
// são a pendência mais urgente do painel do proprietário (Context.md §8.9 — aprovar/recusar não é
// uma ação que pode esperar o locatário desistir), por isso o atalho vive fixo no header (com
// contador) em vez de só dentro de /painel-do-proprietario, que exigiria abrir o menu pra ver.
// Diferente do ReservationsIndicator (relevante pra qualquer conta, já que qualquer um pode
// alugar), só aparece pra quem já anunciou pelo menos uma máquina — mostrar pra quem nunca
// anunciou nada seria ruído permanente no header sem nenhuma utilidade, já que essa conta nunca
// vai ter uma solicitação pra aprovar.
export function OwnerRequestsIndicator() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = pathname?.startsWith("/reservas/recebidas");
  const { data } = useOwnerPendingCount(!!session?.user);
  const count = data?.count;

  if (!session?.user || !data?.hasMachines) return null;

  return (
    <Link
      href="/reservas/recebidas"
      aria-label="Solicitações recebidas"
      aria-current={isActive ? "page" : undefined}
      title="Solicitações recebidas"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center gap-2 rounded-full border transition-colors sm:w-auto sm:justify-start sm:px-3",
        isActive
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="m8.5 13 2.3 2.3L15.5 11" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">Solicitações</span>
      {!!count && count > 0 && (
        <span
          className="bg-primary-500 absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
          aria-hidden="true"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
