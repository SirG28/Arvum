import type { CatalogMachine } from "@/features/machines/components/CatalogMachineCard";
import { MachineShelf } from "./MachineShelf";

interface RecentlyViewedProps {
  machines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
}

// Não renderiza nada quando `machines` está vazio (MachineShelf já cobre isso) — sem cookie de
// histórico ainda (primeira visita, ou cookies bloqueados), a seção simplesmente não aparece, mesma
// regra que HighlightBand.tsx já segue para "aluguéis em andamento".
export function RecentlyViewed({ machines, favoriteIds, isAuthenticated }: RecentlyViewedProps) {
  return (
    <MachineShelf
      title="Vistos recentemente"
      machines={machines}
      favoriteIds={favoriteIds}
      isAuthenticated={isAuthenticated}
    />
  );
}
