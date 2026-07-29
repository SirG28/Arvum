import Link from "next/link";
import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";

type CatalogMachine = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CatalogMachineCardProps {
  machine: CatalogMachine;
  isFavorited: boolean;
  isAuthenticated: boolean;
}

export function CatalogMachineCard({
  machine,
  isFavorited,
  isAuthenticated,
}: CatalogMachineCardProps) {
  const image = machine.images[0];

  return (
    <Card className="relative flex h-full flex-col gap-3 transition-shadow hover:shadow-[var(--shadow-elevation-2)]">
      <FavoriteButton
        machineId={machine.id}
        initialFavorited={isFavorited}
        isAuthenticated={isAuthenticated}
        className="absolute top-2 right-2 z-10"
      />
      <Link href={`/catalogo/${machine.slug}`} className="flex h-full flex-col gap-3">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-neutral-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado
            <img
              src={image.url}
              alt={image.altText ?? machine.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              Sem imagem
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">{machine.title}</h3>
            {machine.requiresOperator && <Badge tone="info">Com operador</Badge>}
          </div>
          <p className="text-sm text-neutral-500">
            {machine.category.name} — {machine.property.city}/{machine.property.state}
          </p>
          <p className="text-primary-700 mt-1 text-sm font-medium">
            A partir de {formatBRL(machine.dailyPriceInCents)}/dia
          </p>
        </div>
      </Link>
    </Card>
  );
}
