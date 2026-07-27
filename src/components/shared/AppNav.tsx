"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/propriedades", label: "Minhas propriedades" },
  { href: "/maquinas", label: "Minhas máquinas" },
  { href: "/catalogo", label: "Catálogo" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex gap-1">
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
