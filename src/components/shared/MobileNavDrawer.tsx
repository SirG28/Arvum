"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./AppNav";

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

// Menu hambúrguer só para mobile (sm:hidden) — em telas maiores o AppNav horizontal já cobre a
// navegação, então este componente não renderiza nada além do próprio botão.
export function MobileNavDrawer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
      >
        <MenuIcon open={open} />
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Navegação principal"
          className="absolute inset-x-0 top-full z-40 flex flex-col gap-1 border-b border-neutral-200 bg-white p-3 shadow-[var(--shadow-elevation-2)]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {session?.user && (
            <>
              <div className="my-1 border-t border-neutral-200" aria-hidden="true" />
              <Link
                href="/perfil"
                aria-current={pathname?.startsWith("/perfil") ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                  pathname?.startsWith("/perfil")
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-700 hover:bg-neutral-50",
                )}
              >
                Meu perfil
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md px-3 py-3 text-left text-sm font-medium text-danger-500 transition-colors hover:bg-neutral-50"
              >
                Sair
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
