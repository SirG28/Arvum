"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { href: "/propriedades", label: "Minhas propriedades" },
  { href: "/maquinas", label: "Minhas máquinas" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/favoritos", label: "Favoritos" },
];

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
