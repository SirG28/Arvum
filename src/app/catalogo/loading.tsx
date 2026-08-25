import { Skeleton } from "@/components/ui/Skeleton";

// Next.js App Router mostra este arquivo automaticamente durante a navegação para /catalogo,
// enquanto listActiveMachines/listCatalogFilterOptions (page.tsx) ainda carregam no servidor —
// sem nenhuma lógica de cliente. Formato aproximado da tela real (Context.md §11.1: "exibir
// carregamento"), para reduzir o salto de layout quando o conteúdo chegar.
export default function CatalogLoading() {
  return (
    <div role="status" aria-label="Carregando catálogo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <Skeleton className="h-40 w-full rounded-md sm:h-32" />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>

      <Skeleton className="h-4 w-40" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>

      <span className="sr-only">Carregando catálogo…</span>
    </div>
  );
}
