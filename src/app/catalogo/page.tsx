import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listActiveCategories } from "@/features/categories/services/category.service";
import {
  listActiveMachines,
  listCatalogFilterOptions,
} from "@/features/machines/services/machine.service";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { parseCatalogFilters } from "@/features/machines/schemas/catalog-filters.schema";
import { CatalogMachineCard } from "@/features/machines/components/CatalogMachineCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
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

  const [user, categories, filterOptions, machines] = await Promise.all([
    getCurrentUser(),
    listActiveCategories(),
    listCatalogFilterOptions(),
    listActiveMachines(filters),
  ]);

  const favoriteIds = user ? await listFavoriteMachineIds(user.id) : new Set<string>();

  const originQuery =
    filters.originCity && filters.originState
      ? { origemCidade: filters.originCity, origemUf: filters.originState }
      : undefined;

  // Campos ocultos que preservam os demais filtros ao trocar de categoria pelos links de pílula.
  const hiddenFields: Record<string, string | undefined> = {
    q,
    precoMin: rawParams.precoMin,
    precoMax: rawParams.precoMax,
    marca: rawParams.marca,
    cultura: rawParams.cultura,
    finalidade: rawParams.finalidade,
    operador: filters.requiresOperator ? "on" : undefined,
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

      <form className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4" action="/catalogo" method="get">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}

        <div>
          <Label htmlFor="q">Buscar por nome da máquina</Label>
          <div className="mt-1.5 flex gap-3">
            <Input id="q" name="q" defaultValue={q} placeholder="Ex.: trator, colheitadeira" />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="precoMin">Preço mínimo (R$/dia)</Label>
            <Input
              id="precoMin"
              name="precoMin"
              type="number"
              min={0}
              step="0.01"
              defaultValue={rawParams.precoMin}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="precoMax">Preço máximo (R$/dia)</Label>
            <Input
              id="precoMax"
              name="precoMax"
              type="number"
              min={0}
              step="0.01"
              defaultValue={rawParams.precoMax}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="marca">Marca</Label>
            <Select id="marca" name="marca" defaultValue={rawParams.marca ?? ""} className="mt-1.5">
              <option value="">Todas</option>
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cultura">Cultura</Label>
            <Select id="cultura" name="cultura" defaultValue={rawParams.cultura ?? ""} className="mt-1.5">
              <option value="">Todas</option>
              {filterOptions.crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="finalidade">Finalidade</Label>
            <Input
              id="finalidade"
              name="finalidade"
              placeholder="Ex.: plantio, colheita"
              defaultValue={rawParams.finalidade}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="origemCidade">Onde você vai usar? — cidade</Label>
            <Input
              id="origemCidade"
              name="origemCidade"
              placeholder="Ex.: Ribeirão Preto"
              defaultValue={rawParams.origemCidade}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="origemUf">Onde você vai usar? — UF</Label>
            <Input
              id="origemUf"
              name="origemUf"
              maxLength={2}
              placeholder="SP"
              defaultValue={rawParams.origemUf}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="raioMax">Raio máximo (km)</Label>
            <Input
              id="raioMax"
              name="raioMax"
              type="number"
              min={0}
              step="1"
              defaultValue={rawParams.raioMax}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dataInicio">Período — data inicial</Label>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="date"
              defaultValue={toDateInputValue(filters.availableFrom)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dataFim">Período — data final</Label>
            <Input
              id="dataFim"
              name="dataFim"
              type="date"
              defaultValue={toDateInputValue(filters.availableTo)}
              className="mt-1.5"
            />
          </div>
          <div className="flex items-end">
            <Checkbox
              id="operador"
              name="operador"
              label="Somente com operador"
              defaultChecked={filters.requiresOperator}
            />
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
