"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { AppNav } from "./AppNav";

export function AppHeader() {
  const { data: session } = useSession();

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
            <span className="text-sm text-neutral-500">{session.user.name}</span>
            <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
