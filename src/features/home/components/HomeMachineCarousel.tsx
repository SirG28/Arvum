"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CarouselArrows } from "@/components/shared/CarouselArrows";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

interface HomeMachineCarouselProps {
  title: string;
  headingLevel?: "h2" | "h3";
  viewAllHref?: string;
  viewAllLabel?: string;
  // Cartões já renderizados no servidor (MachineShelf/MostSearched resolvem `favoriteIds.has(...)`
  // lá, sem cruzar o Set pela fronteira RSC) — este componente só cuida do scroll/arrasto.
  items: { id: string; node: ReactNode }[];
}

// Vitrine horizontal de máquinas — mesma mecânica de FeaturedCategories.tsx (scroll-snap nativo +
// setas via useHorizontalScroll/CarouselArrows), agora reaproveitada pelas "prateleiras" da home
// (MachineShelf, usado por FeaturedMachines/RecentlyViewed, e a metade "máquinas" de MostSearched)
// — antes cada uma renderizava um grid estático (1/2/3 colunas), sem nada de carrossel.
export function HomeMachineCarousel({
  title,
  headingLevel = "h2",
  viewAllHref,
  viewAllLabel,
  items,
}: HomeMachineCarouselProps) {
  const { ref, scrollByStep } = useHorizontalScroll<HTMLDivElement>();
  const Heading = headingLevel;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Heading
          className={
            headingLevel === "h2"
              ? "text-xl font-semibold text-neutral-900"
              : "text-base font-semibold text-neutral-900"
          }
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </Heading>
        <div className="flex shrink-0 items-center gap-3">
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm font-medium text-primary-700 hover:underline">
              {viewAllLabel ?? "Ver todas"}
            </Link>
          )}
          <CarouselArrows
            onPrev={() => scrollByStep("left")}
            onNext={() => scrollByStep("right")}
            prevLabel={`Ver máquinas anteriores em ${title}`}
            nextLabel={`Ver mais máquinas em ${title}`}
          />
        </div>
      </div>

      {/* pt-1: `overflow-x-auto` sem overflow-y explícito faz o eixo vertical virar "auto" também
          (regra do CSS Overflow) — sem essa folga em cima, o hover dos cards (CatalogMachineCard,
          translateY) cortava a borda superior deles contra essa borda de clipping. */}
      <div
        ref={ref}
        role="list"
        className="mt-4 flex snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} role="listitem" className="w-72 shrink-0 snap-start sm:w-80">
            {item.node}
          </div>
        ))}
      </div>
    </div>
  );
}
