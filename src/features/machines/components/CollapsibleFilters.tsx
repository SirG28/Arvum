"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CollapsibleFiltersProps {
  children: ReactNode;
  // Aberto por padrão quando a URL já traz algum desses filtros — nunca esconder do usuário um
  // filtro que ele mesmo aplicou antes de navegar para cá.
  defaultOpen?: boolean;
}

// Em telas pequenas, os filtros avançados (preço, localização, período, raio) ficam atrás de um
// botão — o catálogo abre já mostrando resultado, não um formulário inteiro (Arvum Playbook §03/§04:
// no público rural, mobile-first e com conexão instável, cada rolagem antes do primeiro resultado
// custa a primeira impressão). Em telas >= sm, os filtros continuam sempre visíveis, como antes.
export function CollapsibleFilters({ children, defaultOpen = false }: CollapsibleFiltersProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="advanced-filters"
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={1.6}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn("h-4 w-4 shrink-0 transition-transform duration-fast", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        {open ? "Ocultar filtros" : "Mais filtros"}
      </button>

      <div
        id="advanced-filters"
        className={cn("flex-col gap-4 sm:flex", open ? "flex" : "hidden")}
      >
        {children}
      </div>
    </div>
  );
}
