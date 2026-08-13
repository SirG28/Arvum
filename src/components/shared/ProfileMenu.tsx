"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

// Itens do usuário logado — reaproveitados pelo dropdown desktop (ProfileMenu) e pela
// seção "conta" do MobileNavDrawer, para as duas superfícies não desalinharem.
export const PROFILE_ITEMS = [
  {
    href: "/perfil",
    label: "Meu perfil",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19.5c1.4-3.2 4-4.8 7-4.8s5.6 1.6 7 4.8" />
      </>
    ),
  },
  {
    href: "/propriedades",
    label: "Minhas propriedades",
    icon: (
      <>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    href: "/maquinas",
    label: "Minhas máquinas",
    icon: (
      <>
        <rect x="3.5" y="8" width="12" height="8" rx="1.2" />
        <path d="M15.5 11h2.6L20.5 14v2h-5" />
        <circle cx="8" cy="17.5" r="1.6" />
        <circle cx="17" cy="17.5" r="1.6" />
      </>
    ),
  },
  {
    href: "/favoritos",
    label: "Favoritos",
    icon: <path d="M12 19s-7-4.35-7-9.5A4.25 4.25 0 0 1 12 6.5 4.25 4.25 0 0 1 19 9.5C19 14.65 12 19 12 19Z" />,
  },
  {
    href: "/reservas/recebidas",
    label: "Solicitações recebidas",
    icon: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="m8.5 13 2.3 2.3L15.5 11" />
      </>
    ),
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: (
      <>
        <circle cx="12" cy="12" r="2.6" />
        <path d="M12 3.5v2.1M12 18.4v2.1M4.9 6.9l1.5 1.5M17.6 15.6l1.5 1.5M3.5 12h2.1M18.4 12h2.1M4.9 17.1l1.5-1.5M17.6 8.4l1.5-1.5" />
      </>
    ),
  },
] as const;

function ProfileMenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3.2 4-4.8 7-4.8s5.6 1.6 7 4.8" />
    </svg>
  );
}

// Dropdown de perfil (desktop, sm+). No mobile o header esconde este componente e
// os mesmos PROFILE_ITEMS aparecem dentro do MobileNavDrawer.
export function ProfileMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  if (!session?.user) return null;

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do perfil"
        title={session.user.name ?? "Meu perfil"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          open
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
        )}
      >
        <ProfileMenuIcon />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu do perfil"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[var(--shadow-elevation-2)]"
        >
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="truncate text-sm font-medium text-neutral-900">{session.user.name}</p>
            <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
          </div>

          <div className="flex flex-col py-1">
            {PROFILE_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-neutral-200 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-danger-500 transition-colors hover:bg-neutral-50"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M15 4.5H8a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h7" />
                <path d="M19.5 12H10M19.5 12l-3-3M19.5 12l-3 3" />
              </svg>
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
