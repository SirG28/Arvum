import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/session";

const VALUE_PROPS = [
  {
    title: "Acesso",
    description:
      "Produtores encontram e reservam máquinas agrícolas próximas, sem depender de empréstimos informais.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="6" cy="7" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
        <path d="M8.2 8.6 15.8 15.4" />
      </svg>
    ),
  },
  {
    title: "Otimização de recursos",
    description:
      "Proprietários rentabilizam equipamentos ociosos, aumentando o uso de cada máquina cadastrada.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 12a8 8 0 0 1 13.66-5.66" />
        <path d="M20 12a8 8 0 0 1-13.66 5.66" />
        <path d="M17.5 4v3h-3" />
        <path d="M6.5 20v-3h3" />
      </svg>
    ),
  },
  {
    title: "Logística integrada",
    description:
      "Custo de transporte e forma de entrega calculados de ponta a ponta dentro da própria reserva.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 18c3-6 5-8 8-8s5 2 8 8" />
        <circle cx="4" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="20" cy="18" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const DASHBOARD_LINKS = [
  {
    title: "Minhas propriedades",
    description: "Gerencie as propriedades cadastradas na sua conta.",
    href: "/propriedades",
  },
  {
    title: "Minhas máquinas",
    description: "Cadastre e acompanhe a disponibilidade das suas máquinas.",
    href: "/maquinas",
  },
  {
    title: "Catálogo",
    description: "Veja as máquinas disponíveis de outros produtores.",
    href: "/catalogo",
  },
  {
    title: "Meu perfil",
    description: "Confira seus dados de conta.",
    href: "/perfil",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <AppHeader />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
          <h1
            className="text-2xl font-semibold text-neutral-900 sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Olá, {user.name ?? "produtor"}
          </h1>
          <p className="mt-2 text-base text-neutral-500">
            Bem-vindo(a) de volta à Arvum. O que você quer fazer agora?
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {DASHBOARD_LINKS.map((link) => (
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
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1
            className="text-3xl font-semibold text-neutral-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Transforme máquinas ociosas em produtividade
          </h1>
          <p className="max-w-xl text-base text-neutral-500">
            A Arvum conecta produtores rurais que precisam de máquinas agrícolas a proprietários
            com equipamentos disponíveis, com logística integrada de ponta a ponta.
          </p>
          <Link href="/catalogo">
            <Button>Ver catálogo</Button>
          </Link>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[var(--shadow-elevation-1)]"
              >
                <div className="mb-3 inline-flex rounded-md bg-primary-50 p-2 text-primary-600">
                  {item.icon}
                </div>
                <h2 className="text-sm font-semibold text-neutral-900">{item.title}</h2>
                <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
