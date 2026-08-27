import { BASE_COMMISSION_RATE, PREMIUM_COMMISSION_RATE } from "../config";

// Regra centralizada de redução de comissão para parceiros Premium (Context.md §9.7) — pronta e
// testada, mas ainda não conectada a nenhum fluxo: a comissão em si (Booking.serviceFeeInCents,
// Fase 7) ainda não é calculada em lugar nenhum do projeto.
export function getEffectiveCommissionRate(hasPremium: boolean): number {
  return hasPremium ? PREMIUM_COMMISSION_RATE : BASE_COMMISSION_RATE;
}
