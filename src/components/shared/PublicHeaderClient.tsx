"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { useCrossfadeTransition } from "@/hooks/useCrossfadeTransition";
import { HeaderSearchDocked } from "@/features/home/components/HeaderSearchDocked";
import type { HeaderSearchFieldsCategory } from "@/features/home/components/HeaderSearchFields";
import { CatalogNavLink } from "./CatalogNavLink";
import { HeaderHelpLink } from "./HeaderHelpLink";
import { Logo } from "./Logo";
import { MobileNavDrawer } from "./MobileNavDrawer";

// Mesma grid de 3 colunas e mesma coreografia de crossfade de AppHeaderClient.tsx (ver comentário
// lá, inclusive sobre --ease-playful e o recolher por direção no mobile via `mobileCompact`) — só
// troca as ações da direita (Criar conta/Entrar em vez de Aluguéis/Perfil), sempre fixas na
// coluna 3.
export function PublicHeaderClient({ categories }: { categories: HeaderSearchFieldsCategory[] }) {
  const { shrunk, mobileCompact } = useHeaderScrollState();
  const { displayed: shrunkDisplayed, visible } = useCrossfadeTransition(shrunk);

  const fadeClasses = cn(
    "sm:transition-[opacity,transform,scale] sm:duration-base sm:ease-playful",
    visible ? "sm:translate-y-0 sm:scale-100 sm:opacity-100" : "sm:-translate-y-1 sm:scale-[0.98] sm:opacity-0",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-[var(--shadow-elevation-1)]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 block h-[3px] bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500"
      />
      <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/" className="col-start-1 row-start-1 shrink-0">
          <span
            className={cn(
              "block origin-left transition-[transform] duration-base ease-playful",
              shrunk && "sm:scale-95",
            )}
          >
            <Logo size={36} />
          </span>
        </Link>

        {!shrunkDisplayed && (
          <nav
            aria-label="Navegação principal"
            className={cn("col-start-2 row-start-1 hidden items-center gap-1 sm:flex", fadeClasses)}
          >
            <CatalogNavLink />
            <HeaderHelpLink />
          </nav>
        )}

        <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2 sm:gap-3">
          {/* "Criar conta" só some do mobile (cabe em telas maiores ao lado de "Entrar") — o
              hambúrguer ao lado leva pra ela, e o próprio /login também linka pra /cadastro. */}
          <Link href="/cadastro" className="hidden sm:block">
            <Button variant="secondary">Criar conta</Button>
          </Link>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
          <MobileNavDrawer />
        </div>

        {/* max-height+opacity (não `hidden`) pra animar o recolher no mobile, com
            `overflow-anchor:none` pra evitar o navegador "brigar" com a própria animação — ver
            comentário em AppHeaderClient.tsx. */}
        <div
          className={cn(
            "col-span-3 row-start-2 min-w-0 overflow-hidden transition-[max-height,opacity] duration-base ease-out [overflow-anchor:none]",
            mobileCompact ? "max-h-0 opacity-0" : "max-h-[220px] opacity-100",
            "sm:col-span-1 sm:col-start-2 sm:max-h-none sm:overflow-visible sm:opacity-100",
            shrunkDisplayed && "sm:row-start-1",
            fadeClasses,
          )}
        >
          <HeaderSearchDocked categories={categories} />
        </div>
      </div>
    </header>
  );
}
