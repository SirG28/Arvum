import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { paymentRequestSchema } from "@/features/payments/schemas/payment.schema";
import { confirmSimulatedPayment } from "@/features/payments/services/payment.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Só o locatário do próprio aluguel pode pagá-lo — verificado no servidor
// (confirmSimulatedPayment compara renterId com a sessão), nunca confiando no id vindo do cliente.
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = paymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await confirmSimulatedPayment(session.user.id, id, parsed.data.method);

  if (result === "NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Aluguel não encontrado.", 404);
  }
  if (result === "NOT_AWAITING_PAYMENT") {
    return apiError(
      "BOOKING_NOT_AWAITING_PAYMENT",
      "Este aluguel não está mais aguardando pagamento.",
      409,
    );
  }
  if (result === "EXPIRED") {
    return apiError(
      "BOOKING_HOLD_EXPIRED",
      "O prazo para pagamento expirou. Solicite o aluguel novamente.",
      409,
    );
  }

  return apiSuccess(result, { status: 201 });
}
