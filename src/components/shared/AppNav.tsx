"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./navItems";

// Reexportado para não quebrar quem já importa NAV_ITEMS a partir daqui (ex.: MobileNavDrawer) —
// a lista em si vive em navItems.tsx (módulo sem "use client", importável por Server Components
// como app/page.tsx).
export { NAV_ITEMS };

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
