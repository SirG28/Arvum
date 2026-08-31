import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/features/users/services/user.service";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { ChangePasswordForm } from "@/features/users/components/ChangePasswordForm";
import { ChangeEmailSection } from "@/features/users/components/ChangeEmailSection";

export const metadata = { title: "Segurança" };

export default async function SecuritySettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/configuracoes/seguranca");

  const user = await getUserById(currentUser.id);
  if (!user) redirect("/login?callbackUrl=/configuracoes/seguranca");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackLink href="/configuracoes" label="Configurações" />

      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Senha</h1>
        <p className="mt-1 text-sm text-neutral-500">Altere a senha usada para entrar na Arvum.</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">E-mail</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Usado para entrar na Arvum e receber notificações sobre suas reservas e anúncios.
        </p>
        <div className="mt-4">
          <ChangeEmailSection email={user.email} pendingEmail={user.pendingEmail} />
        </div>
      </Card>
    </div>
  );
}
