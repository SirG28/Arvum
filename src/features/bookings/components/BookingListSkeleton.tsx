import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

// Compartilhado por /reservas/loading.tsx (locatário) e /reservas/recebidas/loading.tsx
// (proprietário) — as duas listas têm exatamente o mesmo formato de card (ver BookingListCard.tsx
// / OwnerBookingListCard.tsx), só a fonte dos dados muda.
export function BookingListSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="aspect-video w-full shrink-0 sm:w-40" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </Card>
        ))}
      </div>

      <span className="sr-only">{label}…</span>
    </div>
  );
}
