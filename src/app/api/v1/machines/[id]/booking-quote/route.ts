import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { bookingRequestSchema } from "@/features/bookings/schemas/booking.schema";
import { buildBookingQuote } from "@/features/bookings/services/booking.service";
import { bookingQuoteErrorResponse } from "@/features/bookings/lib/quote-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Prévia de valores sem gravar nada — mesma validação/cálculo de createBookingRequest
// (buildBookingQuote), para o locatário ver locação + logística + total antes de confirmar
// (Context.md §8.8 passo 6 "sistema calcula custos" ocorre antes da revisão, não só depois).
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const quote = await buildBookingQuote(session.user.id, id, parsed.data);
  if (typeof quote === "string") {
    return bookingQuoteErrorResponse(quote);
  }

  return apiSuccess({
    rentalDays: quote.rentalDays,
    distanceKm: quote.logisticsCost.distanceKm,
    isLogisticsEstimate: quote.logisticsCost.isEstimate,
    totals: quote.totals,
  });
}
