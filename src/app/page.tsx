import { cookies } from "next/headers";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/session";
import { listActiveCategories, listTopCategories } from "@/features/categories/services/category.service";
import {
  listActiveMachines,
  listTopMachines,
  getMachinesByIds,
} from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds, listFavoritesByUser } from "@/features/favorites/services/favorite.service";
import { RECENTLY_VIEWED_COOKIE_NAME, parseRecentlyViewedIds } from "@/features/machines/lib/recently-viewed";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { FeaturedCategories } from "@/features/home/components/FeaturedCategories";
import { RecentlyViewed } from "@/features/home/components/RecentlyViewed";
import { RecommendedMachines } from "@/features/home/components/RecommendedMachines";
import { MostSearched } from "@/features/home/components/MostSearched";
import { FeaturedMachines } from "@/features/home/components/FeaturedMachines";
import { ValueProps } from "@/features/home/components/ValueProps";

const RECOMMENDATION_PAGE_SIZE = 6;

function mostFrequentCategorySlug(categorySlugs: string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const slug of categorySlugs) counts.set(slug, (counts.get(slug) ?? 0) + 1);

  let best: string | undefined;
  let bestCount = 0;
  for (const [slug, count] of counts) {
    if (count > bestCount) {
      best = slug;
      bestCount = count;
    }
  }
  return best;
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();

  const recentIds = parseRecentlyViewedIds(cookieStore.get(RECENTLY_VIEWED_COOKIE_NAME)?.value);

  const [allCategories, topCategories, activeMachinesPage, topMachines, favoriteIds, recentlyViewedMachines] =
    await Promise.all([
      listActiveCategories(),
      listTopCategories(6),
      listActiveMachines({}, { pageSize: 6 }),
      listTopMachines(6),
      user ? listFavoriteMachineIds(user.id) : Promise.resolve(new Set<string>()),
      getMachinesByIds(recentIds),
    ]);

  const featuredMachines = activeMachinesPage.machines;

  // Recomendação sem ML: pega a categoria mais frequente entre os vistos recentemente e, se não
  // houver histórico de visualização, cai pros favoritos do usuário logado — sem nenhum dos dois
  // sinais, a seção simplesmente não renderiza.
  let recommendationCategorySlug: string | undefined;
  if (recentlyViewedMachines.length > 0) {
    recommendationCategorySlug = mostFrequentCategorySlug(
      recentlyViewedMachines.map((machine) => machine.category.slug),
    );
  } else if (user) {
    const favorites = await listFavoritesByUser(user.id);
    recommendationCategorySlug = mostFrequentCategorySlug(
      favorites.map((favorite) => favorite.machine.category.slug),
    );
  }

  const excludedIds = new Set([
    ...recentlyViewedMachines.map((machine) => machine.id),
    ...featuredMachines.map((machine) => machine.id),
  ]);

  const recommendedMachines = recommendationCategorySlug
    ? (
        await listActiveMachines(
          { categorySlug: recommendationCategorySlug },
          { pageSize: RECOMMENDATION_PAGE_SIZE + excludedIds.size },
        )
      ).machines.filter((machine) => !excludedIds.has(machine.id)).slice(0, RECOMMENDATION_PAGE_SIZE)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {user ? <AppHeader /> : <PublicHeader />}

      <main className="flex-1 pb-10">
        <RecommendedMachines
          machines={recommendedMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />

        <HowItWorks />
        <FeaturedCategories categories={allCategories} />

        <RecentlyViewed
          machines={recentlyViewedMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />
        <MostSearched
          topCategories={topCategories}
          topMachines={topMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />
        <FeaturedMachines
          machines={featuredMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />

        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2
            className="text-xl font-semibold text-neutral-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Por que a Arvum
          </h2>
          <div className="mt-4">
            <ValueProps />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
