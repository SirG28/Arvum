import Link from "next/link";
import { listActiveCategories } from "@/features/categories/services/category.service";
import { listActiveMachines } from "@/features/machines/services/machine.service";
import { CatalogMachineCard } from "@/features/machines/components/CatalogMachineCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

export const metadata = { title: "Catálogo de máquinas" };

interface CatalogPageProps {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categoria, q } = await searchParams;

  const [categories, machines] = await Promise.all([
    listActiveCategories(),
    listActiveMachines({ categorySlug: categoria, search: q }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Catálogo de máquinas</h1>
        <p className="text-sm text-neutral-500">
          Explore máquinas agrícolas disponíveis para locação.
        </p>
      </div>

      <form className="flex gap-3" action="/catalogo" method="get">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome da máquina"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo"}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !categoria
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-neutral-200 text-neutral-700",
          )}
        >
          Todas
        </Link>
        {categories.map((category) => {
          const params = new URLSearchParams();
          params.set("categoria", category.slug);
          if (q) params.set("q", q);
          return (
            <Link
              key={category.id}
              href={`/catalogo?${params.toString()}`}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                categoria === category.slug
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-200 text-neutral-700",
              )}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {machines.length === 0 ? (
        <EmptyState
          title="Nenhuma máquina encontrada"
          description="Tente ajustar a busca ou remover o filtro de categoria."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <CatalogMachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}
