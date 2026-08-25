import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { PropertyForm } from "@/features/properties/components/PropertyForm";

export const metadata = { title: "Nova propriedade" };

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/propriedades/nova");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <BackLink href="/propriedades" label="Minhas propriedades" />
      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Cadastrar propriedade</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Essas informações ajudam a calcular a logística de entrega e retirada de máquinas.
        </p>
        <div className="mt-6">
          <PropertyForm />
        </div>
      </Card>
    </div>
  );
}
