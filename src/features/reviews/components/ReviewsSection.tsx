import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/EmptyState";

interface ReviewsSectionProps {
  averageRating: number | null;
  count: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    author: { name: string };
  }>;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ReviewsSection({ averageRating, count, reviews }: ReviewsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">Avaliações</h2>
        {averageRating !== null && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-700">
            <Rating value={averageRating} size="sm" />
            <span>
              {averageRating.toLocaleString("pt-BR")} ({count} {count === 1 ? "avaliação" : "avaliações"})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="Ainda sem avaliações"
          description="Esta máquina ainda não recebeu avaliações de locatários."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-900">{review.author.name}</span>
                <span className="text-xs text-neutral-400">{formatDate(review.createdAt)}</span>
              </div>
              <Rating value={review.rating} size="sm" className="mt-1" />
              {review.comment && <p className="mt-2 text-sm text-neutral-700">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
