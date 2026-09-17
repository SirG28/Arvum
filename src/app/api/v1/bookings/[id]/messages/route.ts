import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { sendMessageSchema } from "@/features/messages/schemas/message.schema";
import { sendMessage } from "@/features/messages/services/message.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Só participantes do aluguel podem enviar mensagem sobre ele (sendMessage verifica no servidor,
// nunca confiando em um papel enviado pelo cliente) — mesmo padrão de createReview/cancelBooking.
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await sendMessage(session.user.id, id, parsed.data);

  if (result === "BOOKING_NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Aluguel não encontrado.", 404);
  }

  return apiSuccess(result, { status: 201 });
}
