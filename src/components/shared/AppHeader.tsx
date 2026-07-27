"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { AppNav } from "./AppNav";

export function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isProfileActive = pathname?.startsWith("/perfil");

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <Logo size={26} />
          </Link>
          <AppNav />
        </div>
        {session?.user && (
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              aria-current={isProfileActive ? "page" : undefined}
              title={session.user.name ?? "Meu perfil"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                isProfileActive
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.6}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 19.5c1.4-3.2 4-4.8 7-4.8s5.6 1.6 7 4.8" />
              </svg>
            </Link>
            <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
