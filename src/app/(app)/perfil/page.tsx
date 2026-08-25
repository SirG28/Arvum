import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/features/users/services/user.service";
import { getUserReviewSummary } from "@/features/reviews/services/review.service";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { ProfileForm } from "@/features/users/components/ProfileForm";
import { ChangeEmailSection } from "@/features/users/components/ChangeEmailSection";
import { DeactivateAccountButton } from "@/features/users/components/DeactivateAccountButton";

export const metadata = { title: "Meu perfil" };

function formatMemberSince(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/perfil");

  const user = await getUserById(currentUser.id);
  if (!user) redirect("/login?callbackUrl=/perfil");

  const { averageRating, count: reviewCount } = await getUserReviewSummary(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Meu perfil</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Essas informações podem ser vistas por quem você aluga ou anuncia uma máquina.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-700">
          {averageRating !== null ? (
            <div className="flex items-center gap-1.5">
              <Rating value={averageRating} size="sm" />
              <span>
                {averageRating.toLocaleString("pt-BR")} ({reviewCount}{" "}
                {reviewCount === 1 ? "avaliação recebida" : "avaliações recebidas"})
              </span>
            </div>
          ) : (
            <span className="text-neutral-400">Ainda sem avaliações recebidas</span>
          )}
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500">Na Arvum desde {formatMemberSince(user.createdAt)}</span>
        </div>

        <div className="mt-6">
          <ProfileForm user={user} />
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">E-mail</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Usado para entrar na Arvum e receber notificações sobre suas reservas e anúncios.
          </p>
          <div className="mt-4">
            <ChangeEmailSection email={user.email} pendingEmail={user.pendingEmail} />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Desativar conta</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Sua conta fica inacessível até ser reativada; o histórico de reservas e avaliações é
            mantido.
          </p>
          <div className="mt-4">
            <DeactivateAccountButton />
          </div>
        </Card>
      </div>
    </div>
  );
}
