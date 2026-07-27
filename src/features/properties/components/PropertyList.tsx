import type { Property } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCard } from "./PropertyCard";

export function PropertyList({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <EmptyState
        title="Nenhuma propriedade cadastrada"
        description="Cadastre uma propriedade para poder anunciar ou receber máquinas."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
