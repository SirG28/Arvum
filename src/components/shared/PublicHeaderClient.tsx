"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { useCrossfadeTransition } from "@/hooks/useCrossfadeTransition";
import { HeaderSearchDocked } from "@/features/home/components/HeaderSearchDocked";
import type { HeaderSearchFieldsCategory } from "@/features/home/components/HeaderSearchFields";
import { CategoriesMenu } from "./CategoriesMenu";
import { HeaderHelpLink } from "./HeaderHelpLink";
import { Logo } from "./Logo";
import { MobileNavDrawer } from "./MobileNavDrawer";

// Mesma grid de 3 colunas e mesma coreografia de crossfade de AppHeaderClient.tsx (ver comentário
// lá) — só troca as ações da direita (Criar conta/Entrar em vez de Aluguéis/Perfil), sempre fixas
// na coluna 3.
export function PublicHeaderClient({ categories }: { categories: HeaderSearchFieldsCategory[] }) {
  const shrunk = useHeaderScrollState();
  const { displayed: shrunkDisplayed, visible } = useCrossfadeTransition(shrunk);

  const fadeClasses = cn(
    "sm:transition-[opacity,transform] sm:duration-fast sm:ease-out",
    visible ? "sm:translate-y-0 sm:opacity-100" : "sm:-translate-y-1 sm:opacity-0",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/" className="col-start-1 row-start-1 shrink-0">
          <Logo size={36} />
        </Link>

        {!shrunkDisplayed && (
          <nav
            aria-label="Navegação principal"
            className={cn("col-start-2 row-start-1 hidden items-center gap-1 sm:flex", fadeClasses)}
          >
            <CategoriesMenu categories={categories} />
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

        <div
          className={cn(
            "col-span-3 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2",
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
