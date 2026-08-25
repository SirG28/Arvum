import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

// Mostrado automaticamente pelo Next.js durante a navegação para /catalogo/[slug], enquanto
// getPublicMachineBySlug e as demais consultas (page.tsx) ainda carregam.
export default function MachineDetailLoading() {
  return (
    <div role="status" aria-label="Carregando máquina" className="flex flex-col gap-6">
      <Skeleton className="h-4 w-24" />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <Skeleton className="aspect-video w-full" />
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square w-full" />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        <Card className="h-fit w-full lg:w-80">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-6 h-10 w-full" />
        </Card>
      </div>

      <Card>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-16 w-full" />
      </Card>

      <span className="sr-only">Carregando máquina…</span>
    </div>
  );
}
