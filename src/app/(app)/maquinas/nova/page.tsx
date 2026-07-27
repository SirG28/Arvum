import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listPropertiesByOwner } from "@/features/properties/services/property.service";
import { listActiveCategories } from "@/features/categories/services/category.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { MachineForm } from "@/features/machines/components/MachineForm";

export const metadata = { title: "Nova máquina" };

export default async function NewMachinePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/maquinas/nova");

  const [properties, categories] = await Promise.all([
    listPropertiesByOwner(user.id),
    listActiveCategories(),
  ]);

  if (properties.length === 0) {
    return (
      <Card className="mx-auto max-w-xl">
        <Alert tone="warning" title="Cadastre uma propriedade antes de anunciar uma máquina">
          Toda máquina precisa estar vinculada a uma propriedade onde ela fica.
        </Alert>
        <Link href="/propriedades/nova" className="mt-4 inline-block">
          <Button>Cadastrar propriedade</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold text-neutral-900">Cadastrar máquina</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Preencha os dados do equipamento. Você poderá adicionar imagens e disponibilidade depois de
        salvar.
      </p>
      <div className="mt-6">
        <MachineForm properties={properties} categories={categories} />
      </div>
    </Card>
  );
}
