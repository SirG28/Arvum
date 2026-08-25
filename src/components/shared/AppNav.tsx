"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

// Navegação geral do site — itens específicos do usuário logado (propriedades, máquinas,
// favoritos, configurações) vivem no menu de perfil (ver ProfileMenu.tsx), não aqui.
//
// O ícone não aparece na barra horizontal do desktop (abaixo) — só existe para o
// MobileNavDrawer, onde este item entra na mesma lista dos PROFILE_ITEMS e precisa do mesmo
// padrão visual (ícone + rótulo) para não destoar dos demais dentro do menu aberto.
export const NAV_ITEMS = [
  {
    href: "/catalogo",
    label: "Catálogo",
    // Traçado do ícone "search" do Feather (mesma família da engrenagem de Configurações).
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
  },
] as const;

// Escondido em telas pequenas — mobile usa o menu hambúrguer (MobileNavDrawer) para não estourar
// a largura do header (4 links + logo + perfil + sair não cabem em ~375px).
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="hidden gap-1 sm:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
