import type { GeoPoint } from "./distance";

interface LocationInput {
  city: string;
  state: string;
}

// Adaptador de geocodificação. Nenhum provedor externo de mapas está configurado neste MVP
// (Context.md §15, §27): a interface permite trocar `mockGeocodingProvider` por uma API real
// (ex.: Google Geocoding, Nominatim) sem alterar quem a consome (services de propriedades e
// catálogo).
export interface GeocodingProvider {
  geocode(input: LocationInput): GeoPoint | null;
}

// Coordenadas aproximadas da capital de cada UF — fallback quando a cidade não está no dicionário
// abaixo. Valores públicos aproximados, não uma consulta a uma API de geocodificação real.
const STATE_CAPITAL_COORDINATES: Record<string, GeoPoint> = {
  AC: { latitude: -9.97499, longitude: -67.8243 },
  AL: { latitude: -9.66599, longitude: -35.735 },
  AP: { latitude: 0.034934, longitude: -51.0694 },
  AM: { latitude: -3.11903, longitude: -60.0217 },
  BA: { latitude: -12.9714, longitude: -38.5014 },
  CE: { latitude: -3.71722, longitude: -38.5433 },
  DF: { latitude: -15.7939, longitude: -47.8828 },
  ES: { latitude: -20.3155, longitude: -40.3128 },
  GO: { latitude: -16.6869, longitude: -49.2648 },
  MA: { latitude: -2.53874, longitude: -44.2825 },
  MT: { latitude: -15.601, longitude: -56.0974 },
  MS: { latitude: -20.4697, longitude: -54.6201 },
  MG: { latitude: -19.9167, longitude: -43.9345 },
  PA: { latitude: -1.45502, longitude: -48.5024 },
  PB: { latitude: -7.11509, longitude: -34.8641 },
  PR: { latitude: -25.4284, longitude: -49.2733 },
  PE: { latitude: -8.04756, longitude: -34.877 },
  PI: { latitude: -5.08921, longitude: -42.8016 },
  RJ: { latitude: -22.9068, longitude: -43.1729 },
  RN: { latitude: -5.7945, longitude: -35.211 },
  RS: { latitude: -30.0346, longitude: -51.2177 },
  RO: { latitude: -8.76116, longitude: -63.9039 },
  RR: { latitude: 2.8235, longitude: -60.6758 },
  SC: { latitude: -27.5954, longitude: -48.548 },
  SP: { latitude: -23.5505, longitude: -46.6333 },
  SE: { latitude: -10.9472, longitude: -37.0731 },
  TO: { latitude: -10.2128, longitude: -48.3603 },
};

// Cidades com coordenada própria (mais precisa que a capital do estado) — cobre os municípios do
// seed de demonstração. Chave: "cidade normalizada|UF".
const KNOWN_CITY_COORDINATES: Record<string, GeoPoint> = {
  "ribeirao preto|SP": { latitude: -21.1775, longitude: -47.8103 },
  "londrina|PR": { latitude: -23.3103, longitude: -51.1628 },
  "rio verde|GO": { latitude: -17.7979, longitude: -50.9188 },
  "passo fundo|RS": { latitude: -28.2628, longitude: -52.4067 },
};

function normalizeCity(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export const mockGeocodingProvider: GeocodingProvider = {
  geocode({ city, state }) {
    const uf = state.trim().toUpperCase();
    const key = `${normalizeCity(city)}|${uf}`;
    return KNOWN_CITY_COORDINATES[key] ?? STATE_CAPITAL_COORDINATES[uf] ?? null;
  },
};
