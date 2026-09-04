"use client";

import { useRef } from "react";
import Link from "next/link";
import type { MachineCategory } from "@prisma/client";
import { CATEGORY_GROUPS } from "@/features/categories/lib/categoryGroups";
import { CategoryIcon } from "./CategoryIcon";

// Paginação por cartões, não por pixels fixos: cada clique nas setas avança/volta uma "página"
// inteira de CARDS_PER_PAGE cartões, nunca deixando um cartão pela metade na borda. GAP_PX espelha
// o `gap-4` da lista abaixo — precisa ser o mesmo valor pro cálculo de largura da página bater.
const CARDS_PER_PAGE = 4;
const GAP_PX = 16;

function ArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Ver tipos anteriores" : "Ver mais tipos"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-[var(--shadow-elevation-1)] transition-colors duration-fast ease-out hover:bg-neutral-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </button>
  );
}

// Explorar por tipo de trabalho (padrão "Grupo de carros" da Localiza), em carrossel — um cartão
// por grupo funcional (Preparo de solo, Colheita...), não uma categoria por uma. As categorias
// específicas dentro de cada grupo ficam só no dropdown "Categorias" do header
// (CategoriesMenu.tsx) — aqui é a visão rápida por tipo, lá é a navegação detalhada.
export function FeaturedCategories({ categories }: { categories: MachineCategory[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const groups = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    categories: group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is MachineCategory => !!c),
  })).filter((group) => group.categories.length > 0);

  // Infinito nas setas: ao chegar na última página, volta pra primeira (e vice-versa) em vez de
  // desabilitar o botão. `scroll-behavior: auto` forçado por um instante em toda troca: junto com
  // `scroll-snap-type: mandatory` no carrossel, `scrollBy({behavior: "smooth"})` corre o risco de
  // ser cancelado pelo próprio navegador no meio do caminho (o snap "puxa" de volta pro ponto mais
  // próximo antes da animação terminar) — instantâneo evita essa disputa. O arrasto por toque
  // continua com a física nativa do navegador, sem passar por aqui.
  function scrollByStep(direction: "left" | "right") {
    const el = scrollerRef.current;
    const firstCard = el?.children[0] as HTMLElement | undefined;
    if (!el || !firstCard) return;

    const pageWidth = CARDS_PER_PAGE * (firstCard.getBoundingClientRect().width + GAP_PX);
    const totalPages = Math.ceil(groups.length / CARDS_PER_PAGE);
    const maxScroll = el.scrollWidth - el.clientWidth;

    // A última página quase sempre tem menos de CARDS_PER_PAGE cartões, então seu alvo "ideal"
    // (nextPage * pageWidth) ultrapassa maxScroll e fica sempre clampado no mesmo valor — dividir
    // esse valor clampado de volta por pageWidth não recupera o índice de página certo (arredonda
    // pra uma página anterior). Detectar as pontas primeiro evita ficar preso ali para sempre.
    const currentPage =
      el.scrollLeft >= maxScroll - 1 ? totalPages - 1 : el.scrollLeft <= 1 ? 0 : Math.round(el.scrollLeft / pageWidth);
    const nextPage = (currentPage + (direction === "right" ? 1 : -1) + totalPages) % totalPages;

    el.style.scrollBehavior = "auto";
    el.scrollLeft = Math.min(nextPage * pageWidth, maxScroll);
    requestAnimationFrame(() => {
      el.style.scrollBehavior = "";
    });
  }

  if (categories.length === 0 || groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Explore por tipo de trabalho
        </h2>
        {/* Setas só fazem sentido com um ponteiro (mouse/trackpad) — no touch o próprio arrasto já
            navega o carrossel, então elas ficam escondidas ali. */}
        <div className="hidden items-center gap-2 sm:flex">
          <ArrowButton direction="left" onClick={() => scrollByStep("left")} />
          <ArrowButton direction="right" onClick={() => scrollByStep("right")} />
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="list"
        className="mt-4 flex snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => {
          const firstCategory = group.categories[0]!;
          return (
            <Link
              key={group.label}
              role="listitem"
              href={{ pathname: "/catalogo", query: { categoria: firstCategory.slug } }}
              className="w-40 shrink-0 snap-start rounded-lg border border-neutral-200 bg-white p-5 shadow-[var(--shadow-elevation-1)] transition-colors hover:border-primary-200 hover:bg-primary-50 sm:w-48"
            >
              <div className="mb-3 inline-flex rounded-md bg-primary-50 p-2 text-primary-600">
                <CategoryIcon slug={firstCategory.slug} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">{group.label}</h3>
              <p className="mt-1 text-xs text-neutral-500">
                {group.categories.length === 1
                  ? "1 tipo de máquina"
                  : `${group.categories.length} tipos de máquina`}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
