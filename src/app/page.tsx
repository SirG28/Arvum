import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { PROFILE_ITEMS } from "@/components/shared/profileItems";
import { NAV_ITEMS } from "@/components/shared/navItems";
import { getCurrentUser } from "@/lib/session";
import { listTopCategories } from "@/features/categories/services/category.service";
import { listActiveMachines } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { countOpenBookingsByRenter } from "@/features/bookings/services/booking.service";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HighlightBand, type HomeStats } from "@/features/home/components/HighlightBand";
import { FeaturedCategories } from "@/features/home/components/FeaturedCategories";
import { FeaturedMachines } from "@/features/home/components/FeaturedMachines";

// Ícones reaproveitados de PROFILE_ITEMS/NAV_ITEMS (menu de perfil e menu hambúrguer) — mesmo
// traçado nos dois lugares, nunca dois desenhos diferentes para o mesmo destino.
const DASHBOARD_LINKS = [
  {
    title: "Minhas propriedades",
    description: "Gerencie as propriedades cadastradas na sua conta.",
    href: "/propriedades",
    icon: PROFILE_ITEMS.find((item) => item.href === "/propriedades")!.icon,
  },
  {
    title: "Painel do proprietário",
    description: "Máquinas, aluguéis recebidos e o Plano Premium, tudo num só lugar.",
    href: "/painel-do-proprietario",
    icon: PROFILE_ITEMS.find((item) => item.href === "/painel-do-proprietario")!.icon,
  },
  {
    title: "Catálogo",
    description: "Veja as máquinas disponíveis de outros produtores.",
    href: "/catalogo",
    icon: NAV_ITEMS.find((item) => item.href === "/catalogo")!.icon,
  },
  {
    title: "Meu perfil",
    description: "Confira seus dados de conta.",
    href: "/perfil",
    icon: PROFILE_ITEMS.find((item) => item.href === "/perfil")!.icon,
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  const [categories, activeMachinesPage, favoriteIds, stats] = await Promise.all([
    listTopCategories(6),
    listActiveMachines({}, { pageSize: 6 }),
    user ? listFavoriteMachineIds(user.id) : Promise.resolve(new Set<string>()),
    user
      ? countOpenBookingsByRenter(user.id).then((openBookings): HomeStats => ({ openBookings }))
      : Promise.resolve(null),
  ]);

  const featuredMachines = activeMachinesPage.machines;
  const pendingCount = stats ? stats.openBookings : 0;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {user ? <AppHeader /> : <PublicHeader />}

      <main className="flex-1 pb-10">
        <HomeHero userName={user ? (user.name ?? null) : undefined} pendingCount={pendingCount} />
        <HighlightBand stats={stats} />

        {user && (
          <section className="mx-auto max-w-5xl px-4 py-10">
            <h2
              className="text-xl font-semibold text-neutral-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Acesso rápido
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {DASHBOARD_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
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
                      {link.icon}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">{link.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{link.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <FeaturedCategories categories={categories} />
        <FeaturedMachines
          machines={featuredMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />
      </main>

      <Footer />
    </div>
  );
}
