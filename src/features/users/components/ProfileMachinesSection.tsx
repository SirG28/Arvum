import { EmptyState } from "@/components/ui/EmptyState";
import { CatalogMachineCard, type CatalogMachine } from "@/features/machines/components/CatalogMachineCard";

interface ProfileMachinesSectionProps {
  ownerName: string;
  machines: CatalogMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
}

// Vitrine de anúncios usada tanto no perfil próprio quanto no público — mesmo componente para que
// as duas telas fiquem visualmente idênticas (a única diferença entre elas é o botão Editar no
// cabeçalho do perfil).
export function ProfileMachinesSection({
  ownerName,
  machines,
  favoriteIds,
  isAuthenticated,
}: ProfileMachinesSectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-neutral-900">Anúncios de {ownerName}</h2>
      {machines.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio no momento"
          description={`${ownerName} não tem máquinas disponíveis para locação agora.`}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {machines.map((machine) => (
            <CatalogMachineCard
              key={machine.id}
              machine={machine}
              isFavorited={favoriteIds.has(machine.id)}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
