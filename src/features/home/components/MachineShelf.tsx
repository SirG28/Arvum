import Link from "next/link";
import { CatalogMachineCard, type CatalogMachine } from "@/features/machines/components/CatalogMachineCard";

interface MachineShelfProps {
  title: string;
  machines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}

// Prateleira de máquinas genérica — FeaturedMachines, RecentlyViewed, RecommendedMachines e a
// metade "máquinas" de MostSearched usam todas o mesmo título+grid, só mudando a lista e o rótulo;
// reaproveitar aqui evita quatro cópias quase idênticas da mesma marcação. Sempre o mesmo
// CatalogMachineCard usado em app/catalogo/page.tsx — nunca dois cards de máquina diferentes.
export function MachineShelf({
  title,
  machines,
  favoriteIds,
  isAuthenticated,
  viewAllHref,
  viewAllLabel,
}: MachineShelfProps) {
  if (machines.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h2
          className="text-xl font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-primary-700 hover:underline">
            {viewAllLabel ?? "Ver todas"}
          </Link>
        )}
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <CatalogMachineCard
            key={machine.id}
            machine={machine}
            isFavorited={favoriteIds.has(machine.id)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </section>
  );
}
