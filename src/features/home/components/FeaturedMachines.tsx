import Link from "next/link";
import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { CatalogMachineCard } from "@/features/machines/components/CatalogMachineCard";

type FeaturedMachine = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
  distanceKm: number | null;
  averageRating: number | null;
  reviewCount: number;
};

interface FeaturedMachinesProps {
  machines: FeaturedMachine[];
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
}

export function FeaturedMachines({ machines, favoriteIds, isAuthenticated }: FeaturedMachinesProps) {
  if (machines.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h2
          className="text-xl font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Máquinas em destaque
        </h2>
        <Link href="/catalogo" className="text-sm font-medium text-primary-700 hover:underline">
          Ver catálogo completo
        </Link>
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
