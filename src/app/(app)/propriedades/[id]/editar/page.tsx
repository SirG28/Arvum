import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { Card } from "@/components/ui/Card";
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
    <Card className="mx-auto max-w-xl">
      <h1 className="text-lg font-semibold text-neutral-900">Editar propriedade</h1>
      <div className="mt-6">
        <PropertyForm property={property} />
      </div>
    </Card>
  );
}
