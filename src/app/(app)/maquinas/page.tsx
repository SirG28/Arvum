import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listMachinesByOwner } from "@/features/machines/services/machine.service";
import { MachineList } from "@/features/machines/components/MachineList";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/PlusIcon";

export const metadata = { title: "Minhas máquinas" };

export default async function MachinesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/maquinas");

  const machines = await listMachinesByOwner(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Minhas máquinas</h1>
          <p className="text-sm text-neutral-500">
            Cadastre e gerencie os anúncios das suas máquinas agrícolas.
          </p>
        </div>
        <Link href="/maquinas/nova" className="shrink-0">
          <Button className="w-full sm:w-auto">
            <PlusIcon />
            Nova máquina
          </Button>
        </Link>
      </div>
      <MachineList machines={machines} />
    </div>
  );
}
