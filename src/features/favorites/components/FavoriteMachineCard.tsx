import Link from "next/link";
import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_BADGE_TONE } from "@/features/machines/lib/status-labels";
import { FavoriteButton } from "./FavoriteButton";

type FavoritedMachine = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FavoriteMachineCard({ machine }: { machine: FavoritedMachine }) {
  const image = machine.images[0];
  // Um anúncio favoritado pode deixar de estar ativo (pausado, arquivado) depois do favorito —
  // ainda listamos aqui, mas sem link para uma página de detalhe que devolveria 404.
  const isAvailable = machine.status === "ACTIVE" && !machine.deletedAt;

  const content = (
    <>
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
          {!isAvailable && <Badge tone={STATUS_BADGE_TONE[machine.status]}>{STATUS_LABELS[machine.status]}</Badge>}
        </div>
        <p className="text-sm text-neutral-500">
          {machine.category.name} — {machine.property.city}/{machine.property.state}
        </p>
        <p className="text-primary-700 mt-1 text-sm font-medium">
          A partir de {formatBRL(machine.dailyPriceInCents)}/dia
        </p>
      </div>
    </>
  );

  return (
    <Card className="relative flex h-full flex-col gap-3">
      <FavoriteButton
        machineId={machine.id}
        initialFavorited
        isAuthenticated
        className="absolute top-2 right-2 z-10"
      />
      {isAvailable ? (
        <Link href={`/catalogo/${machine.slug}`} className="flex h-full flex-col gap-3">
          {content}
        </Link>
      ) : (
        <div className="flex h-full flex-col gap-3">{content}</div>
      )}
    </Card>
  );
}
