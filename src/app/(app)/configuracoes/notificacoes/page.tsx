import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserSettings } from "@/features/users/services/user.service";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { NotificationPreferencesForm } from "@/features/users/components/NotificationPreferencesForm";

export const metadata = { title: "Notificações" };

export default async function NotificationSettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/configuracoes/notificacoes");

  const settings = await getUserSettings(currentUser.id);
  if (!settings) redirect("/login?callbackUrl=/configuracoes/notificacoes");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackLink href="/configuracoes" label="Configurações" />

      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Notificações</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Escolha como quer ser avisado sobre solicitações, pagamentos e o andamento das suas
          reservas.
        </p>
        <div className="mt-6">
          <NotificationPreferencesForm notifyByEmail={settings.notifyByEmail} />
        </div>
      </Card>
    </div>
  );
}
