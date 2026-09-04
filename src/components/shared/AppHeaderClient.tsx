"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { useCrossfadeTransition } from "@/hooks/useCrossfadeTransition";
import { HeaderSearchDocked } from "@/features/home/components/HeaderSearchDocked";
import type { HeaderSearchFieldsCategory } from "@/features/home/components/HeaderSearchFields";
import { CategoriesMenu } from "./CategoriesMenu";
import { HeaderHelpLink } from "./HeaderHelpLink";
import { Logo } from "./Logo";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { ProfileMenu } from "./ProfileMenu";
import { RentalsIndicator } from "./RentalsIndicator";

// Grid de 3 colunas (logo | conteúdo central | ações), padrão Localiza/Airbnb: logo e ações ficam
// fixos nas colunas 1 e 3 em toda página; a coluna central troca de conteúdo (Categorias/Dúvidas ⇄
// busca) e de linha (linha 2, alinhada sob a coluna central ⇄ linha 1, no lugar de
// Categorias/Dúvidas) conforme `shrunk`. Como as duas posições da busca sempre ficam na mesma
// coluna 2 dessa grid, o campo "sobe" exatamente para o espaço que Categorias/Dúvidas ocupavam.
//
// A troca de posição em si usa useCrossfadeTransition (não o `shrunk` bruto) porque grid-row não é
// animável em CSS — o hook esmaece o conteúdo atual antes de aplicar a nova posição, escondendo o
// "pulo" de layout atrás da opacidade zerada (ver comentário em useCrossfadeTransition.ts).
// useHeaderScrollState já tem histerese (limiares diferentes pra encolher/expandir) pra não
// oscilar quando o scroll para bem em cima do limiar.
//
// "use client" aqui (não em AppHeader.tsx) por causa da mesma armadilha de fronteira RSC já
// documentada no projeto: os hooks de scroll só rodam no client, e um Server Component não pode
// passar uma função de render-prop pra um Client Component. AppHeader.tsx busca as categorias no
// servidor e passa como prop simples (serializável) pra este componente.
export function AppHeaderClient({ categories }: { categories: HeaderSearchFieldsCategory[] }) {
  const shrunk = useHeaderScrollState();
  const { displayed: shrunkDisplayed, visible } = useCrossfadeTransition(shrunk);

  // sm: só — no mobile a busca nunca troca de linha (ver comentário abaixo), então não há nada
  // pra esmaecer ali; animar mesmo assim seria um "pisca" gratuito a cada troca de `shrunk`.
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

        {/* Aluguéis/Perfil: sempre coluna 3, linha 1 — nunca se move, em nenhum estado. */}
        <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2">
          <RentalsIndicator />
          <MobileNavDrawer />
          <ProfileMenu />
        </div>

        {/* No mobile a busca sempre fica na própria linha (largura das colunas 1/3 não sobra
            espaço pros campos ao lado da logo/ações); no desktop ela troca de linha com `shrunk`. */}
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
