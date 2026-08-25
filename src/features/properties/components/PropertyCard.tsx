import Link from "next/link";
import type { Property } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { PencilIcon } from "@/components/ui/PencilIcon";
import { iconButtonClassName } from "@/components/ui/IconButton";
import { DeletePropertyButton } from "./DeletePropertyButton";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">{property.name}</h3>
        <p className="text-sm text-neutral-500">
          {property.addressLine}
          {property.number ? `, ${property.number}` : ""} — {property.city}/{property.state}
        </p>
        <p className="text-xs text-neutral-400">CEP {property.postalCode}</p>
      </div>
      <div className="flex shrink-0 gap-2 self-end sm:self-auto">
        <Link
          href={`/propriedades/${property.id}/editar`}
          aria-label="Editar propriedade"
          title="Editar propriedade"
          className={iconButtonClassName()}
        >
          <PencilIcon />
        </Link>
        <DeletePropertyButton propertyId={property.id} />
      </div>
    </Card>
  );
}
