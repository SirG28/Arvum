import { CatalogMachineCard, type CatalogMachine } from "@/features/machines/components/CatalogMachineCard";
import { HomeMachineCarousel } from "./HomeMachineCarousel";

interface MachineShelfProps {
  title: string;
  machines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}

// Prateleira de máquinas genérica — FeaturedMachines e RecentlyViewed usam o mesmo
// título+carrossel, só mudando a lista e o rótulo; reaproveitar aqui evita cópias quase idênticas
// da mesma marcação (a metade "máquinas" de MostSearched usa HomeMachineCarousel diretamente, sem
// passar por este wrapper, porque lá o carrossel já vive dentro de uma <section> própria, junto
// com os chips de categoria — o <section> deste componente duplicaria essa marcação). Sempre o mesmo
// CatalogMachineCard usado em app/catalogo/page.tsx — nunca dois cards de máquina diferentes.
//
// Continua Server Component (favoriteIds.has(...) resolvido aqui, não no client) — só o carrossel
// em si (HomeMachineCarousel) roda no cliente, recebendo os cartões já prontos como children.
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
    <section className="mx-auto max-w-5xl px-4 py-20 sm:py-24">
      <HomeMachineCarousel
        title={title}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
        items={machines.map((machine) => ({
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
    </section>
  );
}
