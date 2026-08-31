import Link from "next/link";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const ROLE_LABELS = { OWNER: "Como proprietário", RENTER: "Como locatário" } as const;

interface ReviewsSectionProps {
  averageRating: number | null;
  count: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    author: { id: string; name: string };
    // Só informado no perfil (próprio/público), onde a lista mistura avaliações recebidas como
    // proprietário e como locatário — a página da máquina não precisa, já que lá é sempre "como
    // proprietário" (locatários avaliando o dono).
    role?: "OWNER" | "RENTER";
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/perfil/${review.author.id}`}
                    className="text-sm font-medium text-neutral-900 hover:underline"
                  >
                    {review.author.name}
                  </Link>
                  {review.role && <Badge tone="neutral">{ROLE_LABELS[review.role]}</Badge>}
                </div>
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
