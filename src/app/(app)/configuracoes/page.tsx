import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Configurações" };

const SETTINGS_LINKS = [
  {
    title: "Segurança",
    description: "Altere a senha usada para entrar na Arvum.",
    href: "/configuracoes/seguranca",
  },
  {
    title: "Notificações",
    description: "Escolha como quer ser avisado sobre reservas e solicitações.",
    href: "/configuracoes/notificacoes",
  },
  {
    title: "Privacidade",
    description: "Termos de uso, política de privacidade e exclusão de dados.",
    href: "/configuracoes/privacidade",
  },
];

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/configuracoes");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold text-neutral-900">Configurações</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Segurança, notificações e privacidade. Para editar seus dados e desativar a conta, acesse{" "}
        <Link href="/perfil" className="text-primary-700 underline">
          Meu perfil
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {SETTINGS_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[var(--shadow-elevation-1)] transition-colors hover:border-primary-200 hover:bg-primary-50"
          >
            <h2 className="text-sm font-semibold text-neutral-900">{link.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
