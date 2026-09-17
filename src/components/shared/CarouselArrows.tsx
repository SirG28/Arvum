"use client";

import { cn } from "@/lib/cn";

interface CarouselArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
  className?: string;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
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
  );
}

// Extraído de FeaturedCategories.tsx — mesmo par de botões-círculo, reaproveitado por
// HomeMachineCarousel. Só faz sentido com um ponteiro (mouse/trackpad): no touch o próprio arrasto
// já navega o carrossel, por isso ficam escondidos ali (decisão original de FeaturedCategories).
export function CarouselArrows({ onPrev, onNext, prevLabel, nextLabel, className }: CarouselArrowsProps) {
  return (
    <div className={cn("hidden items-center gap-2 sm:flex", className)}>
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-[var(--shadow-elevation-1)] transition-colors duration-fast ease-out hover:bg-neutral-50"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-[var(--shadow-elevation-1)] transition-colors duration-fast ease-out hover:bg-neutral-50"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}
