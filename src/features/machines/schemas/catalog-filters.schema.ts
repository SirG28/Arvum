import { z } from "zod";

function emptyToUndefined(value: unknown) {
  return value === "" || value === null || value === undefined ? undefined : value;
}

const optionalNonNegativeNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative("Informe um valor válido.").optional(),
);
const optionalPriceInReais = optionalNonNegativeNumber;

const optionalTrimmedString = z.preprocess(
  emptyToUndefined,
  z.coerce.string().trim().min(1).optional(),
);

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

const rawCatalogFiltersSchema = z.object({
  q: optionalTrimmedString,
  categoria: optionalTrimmedString,
  precoMax: optionalPriceInReais,
  dataInicio: optionalDate,
  dataFim: optionalDate,
  origemCidade: optionalTrimmedString,
  origemUf: optionalTrimmedString,
  raioMax: optionalNonNegativeNumber,
});

export type CatalogFiltersQuery = z.input<typeof rawCatalogFiltersSchema>;

export interface CatalogFiltersResult {
  filters: {
    // Casa com título, marca, finalidade e culturas recomendadas (listActiveMachines) — um único
    // campo de busca cobre o que antes eram filtros dedicados de marca/cultura/finalidade.
    search?: string;
    categorySlug?: string;
    priceMaxInCents?: number;
    availableFrom?: Date;
    availableTo?: Date;
    // Localização informada pelo locatário ("onde será utilizada" — Context.md §8.5). Usada para
    // calcular a distância estimada até cada máquina (adaptador de geocodificação simulado).
    originCity?: string;
    originState?: string;
    maxDistanceKm?: number;
  };
  // Filtros que não puderam ser aplicados por combinação inválida (ex.: preço/período
  // invertidos) — a busca segue com os demais filtros válidos, e a UI avisa o motivo.
  ignored: { field: string; message: string }[];
}

// Parse tolerante: cada filtro é validado e coeccionado individualmente; combinações inválidas
// (ex.: preço mínimo maior que o máximo) são descartadas com um aviso em vez de invalidar a
// busca inteira — evita uma tela de erro para um filtro de catálogo público sem JS.
export function parseCatalogFilters(query: Record<string, string | undefined>): CatalogFiltersResult {
  const parsed = rawCatalogFiltersSchema.safeParse(query);
  const ignored: { field: string; message: string }[] = [];

  if (!parsed.success) {
    return { filters: {}, ignored };
  }

  const { q, categoria } = parsed.data;

  let { precoMax, dataInicio, dataFim, origemCidade, raioMax } = parsed.data;
  const { origemUf } = parsed.data;

  if (dataInicio !== undefined && dataFim !== undefined && dataFim <= dataInicio) {
    ignored.push({
      field: "periodo",
      message: "A data final deve ser posterior à inicial — período ignorado.",
    });
    dataInicio = undefined;
    dataFim = undefined;
  } else if ((dataInicio !== undefined) !== (dataFim !== undefined)) {
    ignored.push({
      field: "periodo",
      message: "Informe a data inicial e a final para filtrar por período — período ignorado.",
    });
    dataInicio = undefined;
    dataFim = undefined;
  }

  let originState = origemUf?.toUpperCase();
  if (originState !== undefined && originState.length !== 2) {
    ignored.push({
      field: "origem",
      message: "UF inválida — use a sigla do estado (ex.: SP). Localização ignorada.",
    });
    origemCidade = undefined;
    originState = undefined;
  } else if ((origemCidade !== undefined) !== (originState !== undefined)) {
    ignored.push({
      field: "origem",
      message: "Informe cidade e UF para calcular a distância — localização ignorada.",
    });
    origemCidade = undefined;
    originState = undefined;
  }

  const hasOrigin = origemCidade !== undefined && originState !== undefined;
  if (raioMax !== undefined && !hasOrigin) {
    ignored.push({
      field: "raioMax",
      message: "Informe onde a máquina será usada para filtrar por distância — raio ignorado.",
    });
    raioMax = undefined;
  }

  return {
    filters: {
      search: q,
      categorySlug: categoria,
      priceMaxInCents: precoMax !== undefined ? Math.round(precoMax * 100) : undefined,
      availableFrom: dataInicio,
      availableTo: dataFim,
      originCity: hasOrigin ? origemCidade : undefined,
      originState: hasOrigin ? originState : undefined,
      maxDistanceKm: raioMax,
    },
    ignored,
  };
}
