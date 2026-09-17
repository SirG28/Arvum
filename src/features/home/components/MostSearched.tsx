import Link from "next/link";
import type { MachineCategory } from "@prisma/client";
import type { CatalogMachine } from "@/features/machines/components/CatalogMachineCard";
import { CatalogMachineCard } from "@/features/machines/components/CatalogMachineCard";
import { CategoryIcon } from "./CategoryIcon";
import { HomeMachineCarousel } from "./HomeMachineCarousel";

interface MostSearchedProps {
  topCategories: MachineCategory[];
  topMachines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
}

// "Mais procurados" — combina o ranking de categorias (listTopCategories, já existente) com o de
// máquinas (listTopMachines, novo) numa única seção, diferente de "Categorias em destaque, por
// grupo" (FeaturedCategories.tsx), que é uma vitrine de navegação por grupo funcional, não um
// ranking de demanda.
export function MostSearched({ topCategories, topMachines, favoriteIds, isAuthenticated }: MostSearchedProps) {
  if (topCategories.length === 0 && topMachines.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:py-24">
      <h2
        className="text-xl font-semibold text-neutral-900"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Mais procurados
      </h2>

      {topCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={{ pathname: "/catalogo", query: { categoria: category.slug } }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <span className="text-primary-600">
                <CategoryIcon slug={category.slug} />
              </span>
              {category.name}
            </Link>
          ))}
        </div>
      )}

      {topMachines.length > 0 && (
        <div className="mt-6">
          <HomeMachineCarousel
            title="Máquinas mais alugadas"
            headingLevel="h3"
            items={topMachines.map((machine) => ({
              id: machine.id,
              node: (
                <CatalogMachineCard
                  machine={machine}
                  isFavorited={favoriteIds.has(machine.id)}
                  isAuthenticated={isAuthenticated}
                />
              ),
            }))}
          />
        </div>
      )}
    </section>
  );
}
