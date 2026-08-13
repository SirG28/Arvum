export interface LogisticsPricingDefaults {
  baseFeeInCents: number;
  pricePerKmInCents: number;
}

// Configuração centralizada da fórmula do Context.md §8.11 — nunca espalhada pelos componentes.
// OWNER_DELIVERY: usado apenas quando o proprietário não definiu preço próprio no anúncio
// (Machine.deliveryPricePerKmInCents/deliveryBaseFeeInCents).
// PARTNER_TRANSPORT: não existe parceiro logístico real integrado (Context.md §8.10) — todo o
// preço vem desta configuração simulada, substituível por uma tabela de transportadoras reais no
// futuro sem alterar quem consome (src/features/logistics/lib/pricing.ts).
export const LOGISTICS_DEFAULTS: Record<"OWNER_DELIVERY" | "PARTNER_TRANSPORT", LogisticsPricingDefaults> = {
  OWNER_DELIVERY: { baseFeeInCents: 3000, pricePerKmInCents: 250 },
  PARTNER_TRANSPORT: { baseFeeInCents: 8000, pricePerKmInCents: 400 },
};
