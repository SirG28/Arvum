import { cookies } from "next/headers";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { Reveal } from "@/components/shared/Reveal";
import { getCurrentUser } from "@/lib/session";
import { listActiveCategories, listTopCategories } from "@/features/categories/services/category.service";
import { listTopMachines, getMachinesByIds } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { RECENTLY_VIEWED_COOKIE_NAME, parseRecentlyViewedIds } from "@/features/machines/lib/recently-viewed";
import { Hero } from "@/features/home/components/Hero";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { FeaturedCategories } from "@/features/home/components/FeaturedCategories";
import { RecentlyViewed } from "@/features/home/components/RecentlyViewed";
import { MostSearched } from "@/features/home/components/MostSearched";
import { ValueProps } from "@/features/home/components/ValueProps";

export default async function HomePage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();

  const recentIds = parseRecentlyViewedIds(cookieStore.get(RECENTLY_VIEWED_COOKIE_NAME)?.value);

  const [allCategories, topCategories, topMachines, favoriteIds, recentlyViewedMachines] = await Promise.all([
    listActiveCategories(),
    listTopCategories(6),
    listTopMachines(6),
    user ? listFavoriteMachineIds(user.id) : Promise.resolve(new Set<string>()),
    getMachinesByIds(recentIds),
  ]);

  // Alternância branco/sem-fundo calculada aqui (não por posição fixa no JSX): RecentlyViewed e
  // MostSearched podem não renderizar nada (sem histórico de navegação, sem ranking) — cada `show`
  // replica exatamente a condição que o próprio componente usa pra retornar null
  // (RecentlyViewed via MachineShelf: machines.length === 0; MostSearched: as duas listas vazias).
  // Decidir "branco ou não" por índice fixo antes de filtrar quebrava a alternância sempre que uma
  // seção do meio sumia — foi exatamente o que aconteceu: sem "Vistos recentemente" (sem
  // login/histórico), "Explore por tipo de trabalho" e "Mais procurados" ficavam lado a lado, as
  // duas sem fundo, parecendo uma seção só.
  //
  // Sem seção própria de "Máquinas em destaque": era a primeira página do catálogo padrão sem
  // filtro nenhum (listActiveMachines({}, {pageSize:6})) reexibida na home — não uma curadoria
  // própria —, e ficava ao lado de "Mais procurados" (que já é um ranking real, por número de
  // aluguéis) parecendo a mesma seção duas vezes. O destaque de parceiro Premium
  // (Context.md §8.21) continua valendo dentro do catálogo (sortByPremiumFirst,
  // machine.service.ts), só não tem mais vitrine própria na home.
  const sections = [
    { key: "how-it-works", show: true, node: <HowItWorks /> },
    { key: "featured-categories", show: allCategories.length > 0, node: <FeaturedCategories categories={allCategories} /> },
    {
      key: "recently-viewed",
      show: recentlyViewedMachines.length > 0,
      node: (
        <RecentlyViewed machines={recentlyViewedMachines} favoriteIds={favoriteIds} isAuthenticated={Boolean(user)} />
      ),
    },
    {
      key: "most-searched",
      show: topCategories.length > 0 || topMachines.length > 0,
      node: (
        <MostSearched
          topCategories={topCategories}
          topMachines={topMachines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(user)}
        />
      ),
    },
    {
      key: "value-props",
      show: true,
      node: (
        <section className="mx-auto max-w-5xl px-4 py-20 sm:py-24">
          <h2 className="text-xl font-semibold text-neutral-900" style={{ fontFamily: "var(--font-display)" }}>
            Por que a Arvum
          </h2>
          <div className="mt-4">
            <ValueProps />
          </div>
        </section>
      ),
    },
  ].filter((section) => section.show);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {user ? <AppHeader /> : <PublicHeader />}

      <main className="flex-1">
        <Hero />

        {sections.map((section, index) => (
          <div key={section.key} className={index % 2 === 0 ? "bg-white" : undefined}>
            <Reveal>{section.node}</Reveal>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
