"use client";

import Link from "next/link";
import type { MachineCategory } from "@prisma/client";
import { CATEGORY_GROUPS } from "@/features/categories/lib/categoryGroups";
import { CarouselArrows } from "@/components/shared/CarouselArrows";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { CategoryIcon } from "./CategoryIcon";

// Explorar por tipo de trabalho (padrão "Grupo de carros" da Localiza), em carrossel — um cartão
// por grupo funcional (Preparo de solo, Colheita...), não uma categoria por uma. As categorias
// específicas dentro de cada grupo ficam só no dropdown "Tipo de máquina" da busca do header
// (MachineCategoryPicker.tsx) — aqui é a visão rápida por tipo, lá é a navegação detalhada.
export function FeaturedCategories({ categories }: { categories: MachineCategory[] }) {
  const { ref: scrollerRef, scrollByStep } = useHorizontalScroll<HTMLDivElement>();

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const groups = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    categories: group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is MachineCategory => !!c),
  })).filter((group) => group.categories.length > 0);

  if (categories.length === 0 || groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:py-24">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Explore por tipo de trabalho
        </h2>
        <CarouselArrows
          onPrev={() => scrollByStep("left")}
          onNext={() => scrollByStep("right")}
          prevLabel="Ver tipos anteriores"
          nextLabel="Ver mais tipos"
        />
      </div>

      {/* pt-1: `overflow-x-auto` sem overflow-y explícito faz o eixo vertical virar "auto" também
          (regra do CSS Overflow) — sem essa folga em cima, `hover:-translate-y-0.5` dos cartões
          cortava a borda superior deles contra essa borda de clipping. */}
      <div
        ref={scrollerRef}
        role="list"
        className="mt-4 flex snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => {
          const firstCategory = group.categories[0]!;
          return (
            <Link
              key={group.label}
              role="listitem"
              href={{ pathname: "/catalogo", query: { categoria: firstCategory.slug } }}
              className="w-40 shrink-0 snap-start rounded-lg border border-neutral-200 bg-white p-5 shadow-[var(--shadow-elevation-1)] transition-[transform,box-shadow,border-color,background-color] duration-fast ease-out hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:shadow-[var(--shadow-elevation-2)] sm:w-48"
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
