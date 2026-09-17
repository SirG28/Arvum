import { BASE_COMMISSION_RATE, PREMIUM_COMMISSION_RATE } from "../config";

// Regra centralizada de redução de comissão para parceiros Premium (Context.md §9.7) — usada por
// calculateCommissionInCents abaixo, nunca espalhada pelo fluxo de pagamento.
export function getEffectiveCommissionRate(hasPremium: boolean): number {
  return hasPremium ? PREMIUM_COMMISSION_RATE : BASE_COMMISSION_RATE;
}

// Comissão sobre operações (Context.md §8.21/§9.7): incide sobre locação + logística + suporte de
// operação contratados — nunca sobre a caução (não é receita da operação, é devolvida ao final).
// Vira Booking.serviceFeeInCents, único componente do preço com taxa dependente do proprietário
// (os demais dependem só do anúncio/aluguel em si).
export function calculateCommissionInCents(baseAmountInCents: number, hasPremium: boolean): number {
  return Math.round(baseAmountInCents * getEffectiveCommissionRate(hasPremium));
}
