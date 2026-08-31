import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPublicUserProfile } from "@/features/users/services/user.service";
import { getUserReviewSummary, getUserReviews } from "@/features/reviews/services/review.service";
import { listActiveMachinesByOwner } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { getSubscriptionByOwner } from "@/features/subscriptions/services/subscription.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { ProfileView } from "@/features/users/components/ProfileView";
import { ProfileMachinesSection } from "@/features/users/components/ProfileMachinesSection";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { Card } from "@/components/ui/Card";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { id } = await params;
  const profileUser = await getPublicUserProfile(id);
  return { title: profileUser ? profileUser.name : "Perfil não encontrado" };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;

  const profileUser = await getPublicUserProfile(id);
  if (!profileUser) notFound();

  const currentUser = await getCurrentUser();
  // Quem vê o próprio perfil por este link (ex.: voltou de um anúncio próprio no catálogo) vai
  // para a versão com o botão Editar, em vez de uma cópia somente-leitura de si mesmo.
  if (currentUser?.id === id) redirect("/perfil");

  const [{ averageRating, count: reviewCount }, reviews, subscription, machines, favoriteIds] =
    await Promise.all([
      getUserReviewSummary(id),
      getUserReviews(id),
      getSubscriptionByOwner(id),
      listActiveMachinesByOwner(id),
      currentUser ? listFavoriteMachineIds(currentUser.id) : Promise.resolve(new Set<string>()),
    ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Card>
        <ProfileView
          user={profileUser}
          averageRating={averageRating}
          reviewCount={reviewCount}
          isVerifiedPartner={isPremiumActive(subscription)}
        />
      </Card>

      <Card>
        <ProfileMachinesSection
          ownerName={profileUser.name}
          machines={machines}
          favoriteIds={favoriteIds}
          isAuthenticated={Boolean(currentUser)}
        />
      </Card>

      <Card>
        <ReviewsSection averageRating={null} count={reviewCount} reviews={reviews} />
      </Card>
    </div>
  );
}
