import type { CatalogMachine } from "@/features/machines/components/CatalogMachineCard";
import { MachineShelf } from "./MachineShelf";

interface RecommendedMachinesProps {
  machines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
}

export function RecommendedMachines({ machines, favoriteIds, isAuthenticated }: RecommendedMachinesProps) {
  return (
    <MachineShelf
      title="Recomendados pra você"
      machines={machines}
      favoriteIds={favoriteIds}
      isAuthenticated={isAuthenticated}
    />
  );
}
