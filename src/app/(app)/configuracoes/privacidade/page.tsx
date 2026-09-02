import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserSettings } from "@/features/users/services/user.service";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { DataDeletionRequestButton } from "@/features/users/components/DataDeletionRequestButton";
import { DeactivateAccountButton } from "@/features/users/components/DeactivateAccountButton";

export const metadata = { title: "Privacidade" };

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function PrivacySettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/configuracoes/privacidade");

  const settings = await getUserSettings(currentUser.id);
  if (!settings) redirect("/login?callbackUrl=/configuracoes/privacidade");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackLink href="/configuracoes" label="Configurações" />

      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Privacidade</h1>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/termos-de-uso" className="text-primary-700 underline">
            Ler os Termos de Uso
          </Link>
          <Link href="/politica-de-privacidade" className="text-primary-700 underline">
            Ler a Política de Privacidade
          </Link>
        </div>
        {settings.termsAcceptedAt && (
          <p className="mt-4 text-xs text-neutral-400">
            Você aceitou os termos em {formatDate(settings.termsAcceptedAt)}.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Exclusão de dados</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Você pode solicitar a exclusão dos seus dados a qualquer momento, conforme a LGPD.
        </p>
        <div className="mt-4">
          <DataDeletionRequestButton requestedAt={settings.dataDeletionRequestedAt} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Desativar conta</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sua conta fica inacessível até ser reativada; o histórico de aluguéis e avaliações é
          mantido.
        </p>
        <div className="mt-4">
          <DeactivateAccountButton />
        </div>
      </Card>
    </div>
  );
}
