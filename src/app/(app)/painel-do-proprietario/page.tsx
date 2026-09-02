import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSubscriptionByOwner } from "@/features/subscriptions/services/subscription.service";
import { getOwnerPerformanceReport } from "@/features/subscriptions/services/report.service";
import { getOwnerHighestDailyPriceInCents } from "@/features/machines/services/machine.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { Card } from "@/components/ui/Card";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { PerformanceReport } from "@/features/subscriptions/components/PerformanceReport";

export const metadata = { title: "Painel do proprietário" };

const RECEIVED_REQUESTS_ICON = (
  <>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
    <path d="m8.5 13 2.3 2.3L15.5 11" />
  </>
);

// "Minhas máquinas" não vive mais em PROFILE_ITEMS (centralizada aqui no painel) — o desenho do
// ícone é o mesmo que estava lá antes de sair do menu genérico.
const MACHINES_ICON = (
  <>
    <rect x="2" y="6" width="14" height="10" rx="1.4" />
    <path d="M16 10h3.2L22 13.5v3h-6" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
  </>
);

// Atalhos exclusivos de quem anuncia máquinas (Context.md §8.19) — "Minhas propriedades"
// deliberadamente fora daqui: não é exclusivo de proprietário, um locatário também cadastra
// propriedade como destino de entrega no aluguel, então continua só no menu de perfil geral.
const OWNER_SHORTCUTS = [
  {
    title: "Minhas máquinas",
    description: "Cadastre e acompanhe a disponibilidade das suas máquinas.",
    href: "/maquinas",
    icon: MACHINES_ICON,
  },
  {
    title: "Aluguéis recebidos",
    description: "Acompanhe os aluguéis das suas máquinas.",
    href: "/alugueis/recebidos",
    icon: RECEIVED_REQUESTS_ICON,
  },
];

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/painel-do-proprietario");

  const subscription = await getSubscriptionByOwner(user.id);
  const active = isPremiumActive(subscription);
  const [report, highestDailyPriceInCents] = await Promise.all([
    active ? getOwnerPerformanceReport(user.id) : Promise.resolve(null),
    active ? Promise.resolve(null) : getOwnerHighestDailyPriceInCents(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Painel do proprietário</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ferramentas para quem anuncia máquinas na Arvum.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OWNER_SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[var(--shadow-elevation-1)] transition-colors hover:border-primary-200 hover:bg-primary-50"
          >
            <div className="mb-3 inline-flex rounded-md bg-primary-50 p-2 text-primary-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.6}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {shortcut.icon}
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{shortcut.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{shortcut.description}</p>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Plano Premium</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Destaque nas buscas, selo de parceiro verificado, redução da comissão e relatórios de
          desempenho.
        </p>
        <div className="mt-4">
          <SubscriptionCard subscription={subscription} highestDailyPriceInCents={highestDailyPriceInCents} />
        </div>
      </Card>

      {report && (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Relatório de desempenho</h2>
          <div className="mt-4">
            <PerformanceReport report={report} />
          </div>
        </Card>
      )}
    </div>
  );
}
