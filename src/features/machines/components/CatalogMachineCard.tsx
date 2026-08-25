import Link from "next/link";
import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";

type CatalogMachine = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
  distanceKm: number | null;
  averageRating: number | null;
  reviewCount: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CatalogMachineCardProps {
  machine: CatalogMachine;
  isFavorited: boolean;
  isAuthenticated: boolean;
  // Localização de origem já aplicada na busca — repassada ao link de detalhe para que a
  // distância estimada continue disponível na página seguinte sem pedir de novo.
  originQuery?: { origemCidade: string; origemUf: string };
}

export function CatalogMachineCard({
  machine,
  isFavorited,
  isAuthenticated,
  originQuery,
}: CatalogMachineCardProps) {
  const image = machine.images[0];

  return (
    <Card className="relative flex h-full flex-col gap-3 transition-[box-shadow,translate] duration-base ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]">
      <FavoriteButton
        machineId={machine.id}
        initialFavorited={isFavorited}
        isAuthenticated={isAuthenticated}
        className="absolute top-2 right-2 z-10"
      />
      <Link
        href={{ pathname: `/catalogo/${machine.slug}`, query: originQuery }}
        className="flex h-full flex-col gap-3"
      >
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
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-sm font-semibold text-neutral-900">{machine.title}</h3>
            {machine.requiresOperator && <Badge tone="info">Com operador</Badge>}
          </div>
          <p className="text-sm text-neutral-500">
            {machine.category.name} — {machine.property.city}/{machine.property.state}
          </p>
          {machine.averageRating !== null && (
            <div className="mt-0.5 flex items-center gap-1 text-sm text-neutral-600">
              <Rating value={machine.averageRating} size="sm" />
              <span>
                {machine.averageRating.toLocaleString("pt-BR")} ({machine.reviewCount})
              </span>
            </div>
          )}
          {machine.distanceKm !== null && (
            <p className="text-sm text-neutral-500">~{machine.distanceKm} km (estimativa)</p>
          )}
          <p className="text-primary-700 mt-1 text-sm font-medium">
            A partir de {formatBRL(machine.dailyPriceInCents)}/dia
          </p>
        </div>
      </Link>
    </Card>
  );
}
