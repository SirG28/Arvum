import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/features/users/services/user.service";
import { getUserReviewSummary, getUserReviews } from "@/features/reviews/services/review.service";
import { listActiveMachinesByOwner } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { getSubscriptionByOwner } from "@/features/subscriptions/services/subscription.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/features/users/components/ProfileForm";
import { ProfileView } from "@/features/users/components/ProfileView";
import { ProfileMachinesSection } from "@/features/users/components/ProfileMachinesSection";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";

export const metadata = { title: "Meu perfil" };

interface ProfilePageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/perfil");

  const user = await getUserById(currentUser.id);
  if (!user) redirect("/login?callbackUrl=/perfil");

  const { edit } = await searchParams;

  // Modo edição é uma tela à parte, não uma seção a mais dentro do perfil — o resto do conteúdo
  // (anúncios, avaliações) só distrairia enquanto a pessoa está mexendo nos próprios dados. E-mail
  // e desativação de conta não aparecem em nenhum dos dois: não são informações de "perfil", ficam
  // em Configurações (Segurança e Privacidade).
  if (edit === "1") {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="text-lg font-semibold text-neutral-900">Editar perfil</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Essas informações podem ser vistas por quem você aluga ou anuncia uma máquina.
          </p>
          <div className="mt-6">
            <ProfileForm user={user} closeHref="/perfil" />
          </div>
        </Card>
      </div>
    );
  }

  const [{ averageRating, count: reviewCount }, reviews, subscription, machines, favoriteIds] =
    await Promise.all([
      getUserReviewSummary(user.id),
      getUserReviews(user.id),
      getSubscriptionByOwner(user.id),
      listActiveMachinesByOwner(user.id),
      listFavoriteMachineIds(user.id),
    ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Card>
        <ProfileView
          user={user}
          averageRating={averageRating}
          reviewCount={reviewCount}
          isVerifiedPartner={isPremiumActive(subscription)}
          editHref="/perfil?edit=1"
        />
      </Card>

      <Card>
        <ProfileMachinesSection
          ownerName={user.name}
          machines={machines}
          favoriteIds={favoriteIds}
          isAuthenticated
        />
      </Card>

      <Card>
        <ReviewsSection
          averageRating={null}
          count={reviewCount}
          reviews={reviews}
          currentUserId={currentUser.id}
        />
      </Card>
    </div>
  );
}
