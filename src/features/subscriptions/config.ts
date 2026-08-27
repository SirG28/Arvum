// Plano Premium para parceiros (Context.md §8.21/§9.7): assinatura mensal, preço único (ponto
// médio da faixa R$99–199 do Context.md) — sem tiers, mesmo padrão de preço fixo centralizado já
// usado pelo Arvum Suporte de Operação (src/features/support/config.ts).
export const PREMIUM_PRICE_IN_CENTS = 14990;
export const PREMIUM_PERIOD_DAYS = 30;

// Comissão sobre operações (Context.md §9.7): "o percentual de comissão pode ser reduzido para
// parceiros com Plano Premium ativo". A comissão em si (Fase 7) ainda não é calculada em nenhum
// lugar do fluxo de reserva — esta regra fica pronta e testada, mas getEffectiveCommissionRate
// (lib/commission.ts) não é chamada por nenhum serviço ainda.
export const BASE_COMMISSION_RATE = 0.12;
export const PREMIUM_COMMISSION_RATE = 0.08;

export const PREMIUM_BENEFITS = [
  "Destaque nas buscas do catálogo",
  "Selo de parceiro verificado",
  "Redução da comissão sobre operações",
  "Acesso a relatórios de desempenho",
] as const;
