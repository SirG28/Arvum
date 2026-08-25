"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";
import { SignOutIcon } from "@/components/ui/SignOutIcon";
import { HEART_ICON_PATH } from "@/components/ui/HeartIcon";
import { USER_ICON_PATHS } from "@/components/ui/UserIcon";

// Itens do usuário logado — reaproveitados pelo dropdown desktop (ProfileMenu) e pela
// seção "conta" do MobileNavDrawer, para as duas superfícies não desalinharem.
//
// "Solicitações recebidas" fica fora desta lista de propósito: por ser urgente (aprovar/recusar
// tem prazo real), ganhou atalho fixo no cabeçalho (OwnerRequestsIndicator.tsx), no mesmo nível de
// "Minhas reservas" (ReservationsIndicator.tsx) — nenhuma das duas jamais esteve aqui dentro,
// então não é uma remoção nova, é manter a mesma regra: o que é urgente vive no cabeçalho, o resto
// vive neste menu.
export const PROFILE_ITEMS = [
  {
    href: "/perfil",
    label: "Meu perfil",
    icon: USER_ICON_PATHS,
  },
  {
    href: "/propriedades",
    label: "Minhas propriedades",
    // Traçado do ícone "home" do Feather.
    icon: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M9 22v-10h6v10" />
      </>
    ),
  },
  {
    href: "/maquinas",
    label: "Minhas máquinas",
    // Sem equivalente no Feather (não tem ícone de maquinário agrícola) — redesenhado maior,
    // ocupando quase todo o viewBox como os demais, em vez do desenho original (confinado a uma
    // faixa estreita no meio do quadro).
    icon: (
      <>
        <rect x="2" y="6" width="14" height="10" rx="1.4" />
        <path d="M16 10h3.2L22 13.5v3h-6" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
  },
  {
    href: "/favoritos",
    label: "Favoritos",
    // Mesmo traçado de HeartIcon.tsx (usado no coração de favoritar no catálogo) — nunca dois
    // desenhos de coração diferentes no mesmo app.
    icon: <path d={HEART_ICON_PATH} />,
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    // Engrenagem real (dentes trapezoidais), não um "sol"/asterisco de linhas finas radiando do
    // centro — o desenho anterior lia mal como ícone de configurações em 16px.
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
  },
] as const;

function ProfileMenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {USER_ICON_PATHS}
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
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color,color,scale] duration-fast ease-out active:scale-[0.97]",
          open
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
        )}
      >
        <ProfileMenuIcon />
      </button>

      {rendered && (
        <div
          role="menu"
          aria-label="Menu do perfil"
          onTransitionEnd={onTransitionEnd}
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[var(--shadow-elevation-2)] transition-[opacity,scale] duration-base ease-out",
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
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
              <SignOutIcon className="h-4 w-4 shrink-0" />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
