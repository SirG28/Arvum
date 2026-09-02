"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useOpenBookingsCount } from "@/features/bookings/hooks/useBookings";

// Ponto de entrada para retomar um aluguel em andamento (aguardando pagamento, em transporte/uso
// etc.) — equivalente ao "Trips" do Turo/Airbnb, não um carrinho: cada aluguel tem uma máquina e
// um proprietário diferentes, então não faz sentido juntar vários em um checkout único (ver
// ProfileMenu.tsx para o menu de conta).
export function RentalsIndicator() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = pathname?.startsWith("/alugueis");
  const { data: count } = useOpenBookingsCount(!!session?.user);

  if (!session?.user) return null;

  return (
    <Link
      href="/alugueis"
      aria-label="Meus aluguéis"
      aria-current={isActive ? "page" : undefined}
      title="Meus aluguéis"
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
        <path d="M4 11h16" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">Aluguéis</span>
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
