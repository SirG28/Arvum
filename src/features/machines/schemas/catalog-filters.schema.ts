import { z } from "zod";

function emptyToUndefined(value: unknown) {
  return value === "" || value === null || value === undefined ? undefined : value;
}

const optionalPriceInReais = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative("Informe um valor válido.").optional(),
);

const optionalTrimmedString = z.preprocess(
  emptyToUndefined,
  z.coerce.string().trim().min(1).optional(),
);

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

const rawCatalogFiltersSchema = z.object({
  q: optionalTrimmedString,
  categoria: optionalTrimmedString,
  precoMin: optionalPriceInReais,
  precoMax: optionalPriceInReais,
  marca: optionalTrimmedString,
  cultura: optionalTrimmedString,
  finalidade: optionalTrimmedString,
  operador: z.preprocess((value) => value === "on" || value === "true", z.boolean()).optional(),
  dataInicio: optionalDate,
  dataFim: optionalDate,
});

export type CatalogFiltersQuery = z.input<typeof rawCatalogFiltersSchema>;

export interface CatalogFiltersResult {
  filters: {
    search?: string;
    categorySlug?: string;
    priceMinInCents?: number;
    priceMaxInCents?: number;
    brand?: string;
    crop?: string;
    purpose?: string;
    requiresOperator?: boolean;
    availableFrom?: Date;
    availableTo?: Date;
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

  const { q, categoria, marca, cultura, finalidade, operador } = parsed.data;

  let { precoMin, precoMax, dataInicio, dataFim } = parsed.data;

  if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
    ignored.push({
      field: "preco",
      message: "O valor mínimo é maior que o máximo — filtro de preço ignorado.",
    });
    precoMin = undefined;
    precoMax = undefined;
  }

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

  return {
    filters: {
      search: q,
      categorySlug: categoria,
      priceMinInCents: precoMin !== undefined ? Math.round(precoMin * 100) : undefined,
      priceMaxInCents: precoMax !== undefined ? Math.round(precoMax * 100) : undefined,
      brand: marca,
      crop: cultura,
      purpose: finalidade,
      requiresOperator: operador,
      availableFrom: dataInicio,
      availableTo: dataFim,
    },
    ignored,
  };
}
