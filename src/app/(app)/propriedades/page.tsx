import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listPropertiesByOwner } from "@/features/properties/services/property.service";
import { PropertyList } from "@/features/properties/components/PropertyList";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/PlusIcon";

export const metadata = { title: "Minhas propriedades" };

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/propriedades");

  const properties = await listPropertiesByOwner(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Minhas propriedades</h1>
          <p className="text-sm text-neutral-500">
            Cadastre onde suas máquinas ficam ou onde vai utilizar equipamentos alugados.
          </p>
        </div>
        <Link href="/propriedades/nova" className="shrink-0">
          <Button className="w-full sm:w-auto">
            <PlusIcon />
            Nova propriedade
          </Button>
        </Link>
      </div>
      <PropertyList properties={properties} />
    </div>
  );
}
