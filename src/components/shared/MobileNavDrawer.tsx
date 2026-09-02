"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";
import { SignOutIcon } from "@/components/ui/SignOutIcon";
import { MenuIcon } from "@/components/ui/MenuIcon";
import { NAV_ITEMS } from "./AppNav";
import { PROFILE_ITEMS } from "./ProfileMenu";
import { ADMIN_MODERATION_ITEM } from "./profileItems";

// Mesmo par ícone+rótulo e mesmo espaçamento (px-4 py-2.5) do dropdown desktop (ProfileMenu) —
// o cartão é o mesmo componente visual nas duas telas, só ganha o item "Início" a mais no mobile.
function DrawerLink({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        {icon}
      </svg>
      {label}
    </Link>
  );
}

// Menu hambúrguer só para mobile (sm:hidden) — em telas maiores o AppNav horizontal e o
// ProfileMenu (dropdown do avatar) já cobrem a navegação. O cartão que abre aqui é o mesmo
// desenho do ProfileMenu (cabeçalho com nome/e-mail, cantos arredondados, divisória antes de
// "Sair da conta") — a única diferença de conteúdo é o item extra "Início", já que no mobile o
// logo do cabeçalho é a única outra forma de voltar à página inicial.
export function MobileNavDrawer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { rendered, visible, onTransitionEnd } = useMountTransition(open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    // Sem `relative` aqui de propósito: o painel abaixo se posiciona a partir do <header
    // className="relative"> (AppHeader.tsx), não deste wrapper — assim `inset-x-4` alcança a
    // largura inteira do cabeçalho, não só a largura do botão.
    <div ref={containerRef} className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md border transition-[background-color,border-color,color,scale] duration-fast ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
          open
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
        )}
      >
        <MenuIcon open={open} />
      </button>

      {rendered && (
        <div
          id="mobile-nav-panel"
          role="menu"
          aria-label="Navegação principal"
          onTransitionEnd={onTransitionEnd}
          className={cn(
            "absolute inset-x-0 top-full z-50 origin-top overflow-hidden rounded-b-lg border-x border-b border-neutral-200 bg-white shadow-[var(--shadow-elevation-2)] transition-[opacity,scale] duration-base ease-out",
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {session?.user && (
            <div className="border-b border-neutral-200 px-4 py-3">
              <p className="truncate text-sm font-medium text-neutral-900">{session.user.name}</p>
              <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
            </div>
          )}

          <div className="flex flex-col py-1">
            <DrawerLink
              href="/"
              label="Início"
              icon={
                <>
                  <path d="M3 9.5 12 3l9 6.5" />
                  <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
                </>
              }
              active={pathname === "/"}
            />
            {NAV_ITEMS.map((item) => (
              <DrawerLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={Boolean(pathname?.startsWith(item.href))}
              />
            ))}
          </div>

          {session?.user && (
            <div className="border-t border-neutral-200 py-1">
              {(session.user.role === "ADMIN"
                ? [...PROFILE_ITEMS, ADMIN_MODERATION_ITEM]
                : PROFILE_ITEMS
              ).map((item) => (
                <DrawerLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={Boolean(pathname?.startsWith(item.href))}
                />
              ))}
            </div>
          )}

          {session?.user && (
            <div className="border-t border-neutral-200 py-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-danger-500 transition-colors hover:bg-neutral-50"
              >
                <SignOutIcon className="h-4 w-4 shrink-0" />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
