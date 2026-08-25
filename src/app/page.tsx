import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/session";
import { listTopCategories } from "@/features/categories/services/category.service";
import { listActiveMachines } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import {
  countOpenBookingsByRenter,
  countPendingBookingsForOwner,
} from "@/features/bookings/services/booking.service";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HighlightBand, type HomeStats } from "@/features/home/components/HighlightBand";
import { FeaturedCategories } from "@/features/home/components/FeaturedCategories";
import { FeaturedMachines } from "@/features/home/components/FeaturedMachines";

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

  const [categories, activeMachines, favoriteIds, stats] = await Promise.all([
    listTopCategories(6),
    listActiveMachines(),
    user ? listFavoriteMachineIds(user.id) : Promise.resolve(new Set<string>()),
    user
      ? Promise.all([countOpenBookingsByRenter(user.id), countPendingBookingsForOwner(user.id)]).then(
          ([openBookings, pendingRequests]): HomeStats => ({ openBookings, pendingRequests }),
        )
      : Promise.resolve(null),
  ]);

  const featuredMachines = activeMachines.slice(0, 6);
  const pendingCount = stats ? stats.openBookings + stats.pendingRequests : 0;

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
