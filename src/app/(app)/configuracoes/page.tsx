import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/configuracoes");

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-lg font-semibold text-neutral-900">Configurações</h1>
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
      <p className="mt-6 text-sm text-neutral-500">
        Preferências de conta, notificações e privacidade em breve.
      </p>
    </Card>
  );
}
