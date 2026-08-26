import rawCities from "./br-cities.json";

export interface CityOption {
  city: string;
  state: string;
}

// Lista completa dos municípios brasileiros (IBGE, localidades/municipios), embutida no bundle —
// mantém o padrão "sem provedor externo" do projeto (ver geocoding.ts) e permite reconhecer/
// desambiguar cidades com o mesmo nome em UFs diferentes sem round-trip de rede a cada tecla.
const CITIES: CityOption[] = (rawCities as [string, string][]).map(([city, state]) => ({
  city,
  state,
}));

export function normalizeCityName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// Índice por nome normalizado — resolve, em O(1), todas as UFs que compartilham um mesmo nome de
// cidade (ex.: "Água Boa" existe em MG e MT).
const CITIES_BY_NORMALIZED_NAME = new Map<string, CityOption[]>();
for (const option of CITIES) {
  const key = normalizeCityName(option.city);
  const bucket = CITIES_BY_NORMALIZED_NAME.get(key);
  if (bucket) bucket.push(option);
  else CITIES_BY_NORMALIZED_NAME.set(key, [option]);
}

// Todas as cidades cujo nome normalizado é exatamente igual ao termo informado — usado para
// resolver o estado automaticamente quando o nome digitado bate uma única cidade, ou para listar
// as opções quando o nome existe em mais de uma UF.
export function findExactCityMatches(query: string): CityOption[] {
  return CITIES_BY_NORMALIZED_NAME.get(normalizeCityName(query)) ?? [];
}

// Sugestões para o autocomplete: prefixo primeiro (caso mais comum ao digitar um nome de cidade),
// completando com match por substring se faltar opções.
export function searchCities(query: string, limit = 8): CityOption[] {
  const normalizedQuery = normalizeCityName(query);
  if (normalizedQuery.length < 2) return [];

  const prefixMatches: CityOption[] = [];
  const containsMatches: CityOption[] = [];

  for (const option of CITIES) {
    const normalizedName = normalizeCityName(option.city);
    if (normalizedName.startsWith(normalizedQuery)) {
      prefixMatches.push(option);
    } else if (normalizedName.includes(normalizedQuery)) {
      containsMatches.push(option);
    }
    if (prefixMatches.length >= limit) break;
  }

  const combined = prefixMatches.length >= limit ? prefixMatches : [...prefixMatches, ...containsMatches];
  return combined
    .sort((a, b) => a.city.localeCompare(b.city, "pt-BR") || a.state.localeCompare(b.state))
    .slice(0, limit);
}
