interface SubscriptionPeriod {
  currentPeriodEnd: Date;
}

// "Ativo" é sempre calculado a partir de currentPeriodEnd, nunca só do status armazenado — sem
// renovação automática simulada (Context.md §27), um registro pode ficar com status ACTIVE no
// banco depois que o período expirou. O status serve só para saber se o parceiro pediu para não
// renovar, não para decidir se os benefícios valem agora.
export function isPremiumActive(
  subscription: SubscriptionPeriod | null,
  now: Date = new Date(),
): boolean {
  return subscription != null && subscription.currentPeriodEnd > now;
}
