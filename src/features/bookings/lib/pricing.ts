const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Conta dias corridos entre as duas datas (mesma semântica de "De"/"Até" já usada pelos
// bloqueios manuais de disponibilidade). Nunca retorna menos de 1 dia.
export function calculateRentalDays(startDate: Date, endDate: Date): number {
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS));
}

interface BookingTotalsInput {
  rentalDays: number;
  dailyPriceInCents: number;
  depositInCents?: number | null;
  logisticsValueInCents?: number;
  serviceFeeInCents?: number;
  discountInCents?: number;
}

interface BookingTotals {
  rentalValueInCents: number;
  logisticsValueInCents: number;
  serviceFeeInCents: number;
  depositInCents: number;
  discountInCents: number;
  totalValueInCents: number;
}

// Composição transparente do valor da locação (Context.md §8.12):
// total = locacao + logistica + taxaServico + caucao - descontos.
// Cálculo logístico real e taxa de serviço chegam nas próximas etapas da Fase 4 — por ora,
// entram como zero para não travar o fluxo de solicitação de reserva.
export function calculateBookingTotals({
  rentalDays,
  dailyPriceInCents,
  depositInCents = 0,
  logisticsValueInCents = 0,
  serviceFeeInCents = 0,
  discountInCents = 0,
}: BookingTotalsInput): BookingTotals {
  const rentalValueInCents = rentalDays * dailyPriceInCents;
  const deposit = depositInCents ?? 0;
  const totalValueInCents =
    rentalValueInCents + logisticsValueInCents + serviceFeeInCents + deposit - discountInCents;

  return {
    rentalValueInCents,
    logisticsValueInCents,
    serviceFeeInCents,
    depositInCents: deposit,
    discountInCents,
    totalValueInCents,
  };
}
