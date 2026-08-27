"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";
import { SignOutIcon } from "@/components/ui/SignOutIcon";
import { USER_ICON_PATHS } from "@/components/ui/UserIcon";
import { PROFILE_ITEMS } from "./profileItems";

// Reexportado para não quebrar quem já importa PROFILE_ITEMS a partir daqui (ex.: MobileNavDrawer)
// — a lista em si vive em profileItems.tsx (módulo sem "use client", importável por Server
// Components como app/page.tsx).
export { PROFILE_ITEMS };

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
