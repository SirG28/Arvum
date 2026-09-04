import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { DateRangeFilterField } from "@/components/ui/DateRangeFilterField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CATEGORY_GROUPS } from "@/features/categories/lib/categoryGroups";

export interface HeaderSearchFieldsCategory {
  slug: string;
  name: string;
}

interface HeaderSearchFieldsProps {
  categories: HeaderSearchFieldsCategory[];
  className?: string;
}

function buildOptionGroups(categories: HeaderSearchFieldsCategory[]) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const grouped = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    categories: group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is HeaderSearchFieldsCategory => !!c),
  })).filter((group) => group.categories.length > 0);

  const groupedSlugs = new Set(CATEGORY_GROUPS.flatMap((group) => group.slugs));
  const ungrouped = categories.filter((category) => !groupedSlugs.has(category.slug));
  if (ungrouped.length > 0) grouped.push({ label: "Outras categorias", categories: ungrouped });

  return grouped;
}

// Os 3 campos da busca do header (Máquina · Onde · Quando), no padrão da barra da Localiza:
// identificação de cada campo pelo próprio placeholder/opção padrão, sem rótulo visível acima
// (rótulo continua existindo pra leitor de tela via `sr-only`, CityAutocomplete/DateRangePicker
// já suportam isso via `hideLabel`). Usado tanto pela versão "docada" (linha 2, header não rolado,
// HeaderSearchDocked.tsx) quanto pela versão que sobe pra linha 1 ao rolar (HeaderSearchInline.tsx)
// — nunca dois conjuntos de campos com código diferente.
export function HeaderSearchFields({ categories, className }: HeaderSearchFieldsProps) {
  const optionGroups = buildOptionGroups(categories);

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:flex sm:items-end sm:gap-2", className)}>
      <div className="col-span-2 sm:col-span-1 sm:w-48">
        <label htmlFor="header-categoria" className="sr-only">
          Máquina
        </label>
        <select
          id="header-categoria"
          name="categoria"
          defaultValue=""
          className="block w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          <option value="">Máquina</option>
          {optionGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <CityAutocomplete
        cityFieldName="origemCidade"
        stateFieldName="origemUf"
        label="Onde"
        placeholder="Onde você vai usar?"
        hideLabel
        className="sm:w-52"
      />
      <DateRangeFilterField
        startFieldName="dataInicio"
        endFieldName="dataFim"
        label="Quando"
        hideLabel
        className="sm:w-52"
      />
      <Button type="submit" className="col-span-2 sm:col-span-1 sm:w-auto">
        Buscar
      </Button>
    </div>
  );
}
