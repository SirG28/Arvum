import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listActiveCategories } from "@/features/categories/services/category.service";
import { listActiveMachines } from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { parseCatalogFilters } from "@/features/machines/schemas/catalog-filters.schema";
import { CatalogMachineCard } from "@/features/machines/components/CatalogMachineCard";
import { CollapsibleFilters } from "@/features/machines/components/CollapsibleFilters";
import { Input } from "@/components/ui/Input";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { DateRangeFilterField } from "@/components/ui/DateRangeFilterField";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

export const metadata = { title: "Catálogo de máquinas" };

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function toDateInputValue(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const rawParams = await searchParams;
  const { filters, ignored } = parseCatalogFilters(rawParams);
  const { categorySlug: categoria, search: q } = filters;

  const [user, categories, machines] = await Promise.all([
    getCurrentUser(),
    listActiveCategories(),
    listActiveMachines(filters),
  ]);

  const favoriteIds = user ? await listFavoriteMachineIds(user.id) : new Set<string>();

  const originQuery =
    filters.originCity && filters.originState
      ? { origemCidade: filters.originCity, origemUf: filters.originState }
      : undefined;

  // Em mobile, o painel de filtros avançados só abre sozinho se a URL já trouxer um deles
  // aplicado — quem chegou aqui com um link filtrado precisa ver o que está filtrando, não
  // adivinhar atrás do botão "Mais filtros".
  const hasAdvancedFilters = Boolean(
    rawParams.precoMax ||
      filters.originCity ||
      filters.availableFrom ||
      filters.availableTo ||
      (rawParams.raioMax && Number(rawParams.raioMax) < 500),
  );

  // Campos ocultos que preservam os demais filtros ao trocar de categoria pelos links de pílula.
  const hiddenFields: Record<string, string | undefined> = {
    q,
    precoMax: rawParams.precoMax,
    dataInicio: toDateInputValue(filters.availableFrom),
    dataFim: toDateInputValue(filters.availableTo),
    origemCidade: filters.originCity,
    origemUf: filters.originState,
    raioMax: rawParams.raioMax,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Catálogo de máquinas</h1>
        <p className="text-sm text-neutral-500">
          Explore máquinas agrícolas disponíveis para locação.
        </p>
      </div>

      {ignored.map((issue) => (
        <Alert key={issue.field} tone="warning" title={issue.message} />
      ))}

      {/* key força remount ao navegar (inclusive na navegação client-side do "Limpar filtros"),
          para os inputs não controlados (defaultValue) e os Client Components de filtro
          (CityAutocomplete, DateRangeFilterField, RangeSlider) resincronizarem seu estado interno
          com a nova URL — sem isso, eles só leem seu valor inicial na primeira montagem. */}
      <form
        key={JSON.stringify(rawParams)}
        className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4"
        action="/catalogo"
        method="get"
      >
        {categoria && <input type="hidden" name="categoria" value={categoria} />}

        <div>
          <Label htmlFor="q">Buscar</Label>
          <div className="mt-1.5 flex gap-3">
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Ex.: trator, John Deere, colheita de soja"
            />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Busca por nome, marca, finalidade e cultura recomendada.
          </p>
        </div>

        <CollapsibleFilters defaultOpen={hasAdvancedFilters}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="precoMax">Preço máximo (R$/dia)</Label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-neutral-500">
                  R$
                </span>
                <Input
                  id="precoMax"
                  name="precoMax"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Ex.: 500"
                  defaultValue={rawParams.precoMax}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <CityAutocomplete
                cityFieldName="origemCidade"
                stateFieldName="origemUf"
                label="Onde você vai usar?"
                defaultCity={filters.originCity}
                defaultState={filters.originState}
              />
            </div>
            <div>
              <DateRangeFilterField
                startFieldName="dataInicio"
                endFieldName="dataFim"
                label="Período"
                defaultStartDate={toDateInputValue(filters.availableFrom)}
                defaultEndDate={toDateInputValue(filters.availableTo)}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="raioMax">Raio máximo</Label>
              <div className="flex flex-1 items-center">
                <RangeSlider
                  id="raioMax"
                  name="raioMax"
                  min={0}
                  max={500}
                  step={10}
                  defaultValue={rawParams.raioMax ? Number(rawParams.raioMax) : 500}
                  unlimitedValue={500}
                  unit=" km"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Aplicar filtros</Button>
            <Link href="/catalogo">
              <Button type="button" variant="secondary">
                Limpar filtros
              </Button>
            </Link>
          </div>
        </CollapsibleFilters>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={{ pathname: "/catalogo", query: cleanQuery({ ...hiddenFields }) }}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !categoria
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-neutral-200 text-neutral-700",
          )}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={{
              pathname: "/catalogo",
              query: cleanQuery({ ...hiddenFields, categoria: category.slug }),
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              categoria === category.slug
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 text-neutral-700",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <p className="text-sm text-neutral-500">
        {machines.length} {machines.length === 1 ? "máquina encontrada" : "máquinas encontradas"}
      </p>

      {machines.length === 0 ? (
        <EmptyState
          title="Nenhuma máquina encontrada"
          description="Tente ajustar os filtros ou removê-los para ver mais resultados."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <CatalogMachineCard
              key={machine.id}
              machine={machine}
              isFavorited={favoriteIds.has(machine.id)}
              isAuthenticated={Boolean(user)}
              originQuery={originQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function cleanQuery(query: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => Boolean(value)));
}
