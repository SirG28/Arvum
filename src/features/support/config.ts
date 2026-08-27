// Arvum Suporte de Operação (Context.md §8.21/§9.7): serviço opcional contratado por reserva,
// preço fixo centralizado aqui — mesmo padrão de src/features/logistics/config.ts. Nunca espalhar
// esse valor pelos componentes de interface.
export const OPERATION_SUPPORT_PRICE_IN_CENTS = 4990;

export const OPERATION_SUPPORT_INFO = {
  label: "Arvum Suporte de Operação",
  description: "Atendimento prioritário e mediação de imprevistos durante a locação.",
  benefits: [
    "Atendimento prioritário durante todo o período da locação",
    "Mediação ativa de imprevistos com o proprietário",
  ],
  // Context.md §9.7: nunca sugerir cobertura financeira contra danos — é suporte operacional, não
  // seguro.
  disclaimer: "Suporte operacional — não é um seguro e não cobre danos financeiros.",
} as const;
