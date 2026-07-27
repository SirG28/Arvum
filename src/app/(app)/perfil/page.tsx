import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Meu perfil" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/perfil");

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-lg font-semibold text-neutral-900">Meu perfil</h1>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Nome</dt>
          <dd className="text-neutral-900">{user.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">E-mail</dt>
          <dd className="text-neutral-900">{user.email}</dd>
        </div>
      </dl>
    </Card>
  );
}
