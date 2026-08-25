import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { PropertyForm } from "@/features/properties/components/PropertyForm";

export const metadata = { title: "Editar propriedade" };

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/login?callbackUrl=/propriedades/${id}/editar`);

  const property = await getOwnedProperty(user.id, id);
  if (!property) notFound();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <BackLink href="/propriedades" label="Minhas propriedades" />
      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Editar propriedade</h1>
        <div className="mt-6">
          <PropertyForm property={property} />
        </div>
      </Card>
    </div>
  );
}
