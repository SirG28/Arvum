import Link from "next/link";
import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_BADGE_TONE } from "../lib/status-labels";

type MachineWithRelations = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MachineCard({ machine }: { machine: MachineWithRelations }) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">{machine.title}</h3>
          <Badge tone={STATUS_BADGE_TONE[machine.status]}>{STATUS_LABELS[machine.status]}</Badge>
        </div>
        <p className="text-sm text-neutral-500">
          {machine.category.name} — {machine.property.city}/{machine.property.state}
        </p>
        <p className="text-xs text-neutral-400">Diária: {formatBRL(machine.dailyPriceInCents)}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href={`/maquinas/${machine.id}/editar`}>
          <Button variant="secondary">Gerenciar</Button>
        </Link>
      </div>
    </Card>
  );
}
