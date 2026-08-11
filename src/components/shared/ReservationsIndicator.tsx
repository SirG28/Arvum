"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useOpenBookingsCount } from "@/features/bookings/hooks/useBookings";

// Ponto de entrada para retomar uma reserva em andamento (aguardando aprovação, aprovada mas
// sem pagamento etc.) e seguir para o checkout — equivalente ao "Trips" do Turo/Airbnb, não um
// carrinho: cada reserva tem um dono diferente aprovando individualmente, então não faz sentido
// juntar várias em um checkout único (ver ProfileMenu.tsx para o menu de conta).
export function ReservationsIndicator() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = pathname?.startsWith("/reservas");
  const { data: count } = useOpenBookingsCount(!!session?.user);

  if (!session?.user) return null;

  return (
    <Link
      href="/reservas"
      aria-label="Minhas reservas"
      aria-current={isActive ? "page" : undefined}
      title="Minhas reservas"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        isActive
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="M4 11h16" />
      </svg>
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
