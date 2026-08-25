import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { ChangePasswordForm } from "@/features/users/components/ChangePasswordForm";

export const metadata = { title: "Segurança" };

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/configuracoes/seguranca");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackLink href="/configuracoes" label="Configurações" />

      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Segurança</h1>
        <p className="mt-1 text-sm text-neutral-500">Altere a senha usada para entrar na Arvum.</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </Card>
    </div>
  );
}
