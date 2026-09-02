import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnedMachine } from "@/features/machines/services/machine.service";
import { listPropertiesByOwner } from "@/features/properties/services/property.service";
import { listActiveCategories } from "@/features/categories/services/category.service";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { MachineForm } from "@/features/machines/components/MachineForm";
import { MachineImageManager } from "@/features/machines/components/MachineImageManager";
import { MachineAvailabilityManager } from "@/features/machines/components/MachineAvailabilityManager";
import { MachineStatusActions } from "@/features/machines/components/MachineStatusActions";
import { DeleteMachineButton } from "@/features/machines/components/DeleteMachineButton";

export const metadata = { title: "Editar máquina" };

interface EditMachinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMachinePage({ params }: EditMachinePageProps) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/login?callbackUrl=/maquinas/${id}/editar`);

  const machine = await getOwnedMachine(user.id, id);
  if (!machine) notFound();

  const [properties, categories] = await Promise.all([
    listPropertiesByOwner(user.id),
    listActiveCategories(),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <BackLink href="/maquinas" label="Minhas máquinas" />

      <Card>
        <h2 className="text-lg font-semibold text-neutral-900">Dados da máquina</h2>
        <div className="mt-6">
          <MachineForm machine={machine} properties={properties} categories={categories} />
        </div>
      </Card>

      <Card id="imagens" className="scroll-mt-6">
        <h2 className="text-lg font-semibold text-neutral-900">Imagens</h2>
        <div className="mt-6">
          <MachineImageManager machineId={machine.id} images={machine.images} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-neutral-900">Disponibilidade</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Bloqueie manualmente períodos em que a máquina não estará disponível para locação.
        </p>
        <div className="mt-6">
          <MachineAvailabilityManager machineId={machine.id} blocks={machine.availability} />
        </div>
      </Card>

      {/* Depois dos dados, fotos e disponibilidade — não faz sentido pedir a decisão de publicar
          (ou pausar/arquivar) antes do proprietário sequer ter preenchido/revisado o anúncio. */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900">Status do anúncio</h2>
        <div className="mt-4">
          <MachineStatusActions machineId={machine.id} status={machine.status} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-neutral-900">Remover máquina</h2>
        <p className="mt-1 text-sm text-neutral-500">
          A remoção é definitiva e só é permitida quando não há aluguéis ativos vinculados.
        </p>
        <div className="mt-4">
          <DeleteMachineButton machineId={machine.id} />
        </div>
      </Card>
    </div>
  );
}
