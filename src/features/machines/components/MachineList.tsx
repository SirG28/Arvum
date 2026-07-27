import type { Machine, MachineCategory, MachineImage, Property } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { MachineCard } from "./MachineCard";

type MachineWithRelations = Machine & {
  category: MachineCategory;
  property: Property;
  images: MachineImage[];
};

export function MachineList({ machines }: { machines: MachineWithRelations[] }) {
  if (machines.length === 0) {
    return (
      <EmptyState
        title="Nenhuma máquina cadastrada"
        description="Cadastre uma máquina para começar a receber solicitações de locação."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {machines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
}
