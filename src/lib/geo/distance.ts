export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Fórmula de Haversine — distância em linha reta entre duas coordenadas. Serve de base para o
// "distância estimada" do catálogo (Context.md §8.5) e será reaproveitada pelo cálculo logístico
// (§8.11) quando a Fase 4 existir.
export function calculateDistanceKm(origin: GeoPoint, destination: GeoPoint): number {
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}
