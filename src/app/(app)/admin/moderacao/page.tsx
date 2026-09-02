import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listReportedReviews } from "@/features/reviews/services/review.service";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModerateReviewActions } from "@/features/reviews/components/ModerateReviewActions";

export const metadata = { title: "Moderação de avaliações" };

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Acesso restrito a administradores (Context.md §5.4) — notFound em vez de redirect/403, mesmo
// padrão de getBookingForRenter/Owner: não revela a existência do painel a quem é estranho a ele.
export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const reviews = await listReportedReviews();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Moderação de avaliações</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Avaliações denunciadas por usuários, aguardando revisão antes de continuarem visíveis ou
          serem ocultadas.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="Nenhuma denúncia pendente"
          description="Quando alguém denunciar uma avaliação, ela aparece aqui para revisão."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {review.author.name} avaliou {review.targetUser.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Máquina: {review.machine.title} — denunciada em {formatDate(review.updatedAt)}
                  </p>
                </div>
                <Rating value={review.rating} size="sm" />
              </div>

              {review.comment && (
                <p className="text-sm text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
              )}

              {review.reportReason && (
                <Alert tone="warning" title={`Motivo da denúncia: ${review.reportReason}`} />
              )}

              <ModerateReviewActions reviewId={review.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
