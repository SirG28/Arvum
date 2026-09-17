import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { DateRangeFilterField } from "@/components/ui/DateRangeFilterField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { MachineCategoryPicker } from "./MachineCategoryPicker";

export interface HeaderSearchFieldsCategory {
  slug: string;
  name: string;
}

interface HeaderSearchFieldsProps {
  categories: HeaderSearchFieldsCategory[];
  className?: string;
}

// Os 3 campos da busca do header (Tipo de máquina · Onde · Quando), no padrão da barra da
// Localiza: identificação de cada campo pelo próprio placeholder/texto do botão, sem rótulo
// visível acima (CityAutocomplete/DateRangeFilterField escondem o próprio <label> via `hideLabel`
// mas mantêm o nome acessível; MachineCategoryPicker nem precisa disso — o texto do botão-gatilho
// já é o nome acessível). Usado tanto pela versão "docada" (linha 2, header não rolado,
// HeaderSearchDocked.tsx) quanto pela versão que sobe pra linha 1 ao rolar
// (HeaderSearchInline.tsx) — nunca dois conjuntos de campos com código diferente.
export function HeaderSearchFields({ categories, className }: HeaderSearchFieldsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:flex sm:items-end sm:gap-2", className)}>
      <MachineCategoryPicker categories={categories} name="categoria" className="col-span-2 sm:col-span-1 sm:w-48" />
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
