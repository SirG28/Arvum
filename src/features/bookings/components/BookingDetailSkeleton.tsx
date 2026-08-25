import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

// Compartilhado por /reservas/[id]/loading.tsx (locatário) e /reservas/recebidas/[id]/loading.tsx
// (proprietário) — os dois detalhes seguem a mesma estrutura de cards (imagem+dados, valores,
// andamento); a diferença de conteúdo entre os dois papéis não importa para um placeholder.
export function BookingDetailSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-56" />
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row">
        <Skeleton className="aspect-video w-full shrink-0 sm:w-48" />
        <div className="grid flex-1 grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>

      <Card>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-20 w-full" />
      </Card>

      <Card>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-16 w-full" />
      </Card>

      <span className="sr-only">{label}…</span>
    </div>
  );
}
