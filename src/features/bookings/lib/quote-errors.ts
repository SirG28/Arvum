import { apiError } from "@/lib/api-response";
import type { BookingQuoteError } from "../services/booking.service";

// Único lugar com o texto de cada erro de cotação/reserva — reaproveitado pela rota de criação e
// pela rota de prévia de preço, para nunca haver duas mensagens diferentes para o mesmo erro
// (Context.md §11.5: mensagens de erro devem explicar o que aconteceu e o que fazer).
const BOOKING_QUOTE_ERROR_RESPONSES: Record<BookingQuoteError, { message: string; status: number }> = {
  MACHINE_NOT_FOUND: { message: "Máquina não encontrada.", status: 404 },
  CANNOT_BOOK_OWN_MACHINE: {
    message: "Você não pode reservar uma máquina anunciada por você mesmo.",
    status: 403,
  },
  PROPERTY_NOT_OWNED: {
    message: "Selecione uma propriedade cadastrada na sua conta como destino.",
    status: 403,
  },
  RENTAL_PERIOD_TOO_SHORT: {
    message: "O período informado é menor que a duração mínima de locação desta máquina.",
    status: 422,
  },
  RENTAL_PERIOD_TOO_LONG: {
    message: "O período informado é maior que a duração máxima de locação desta máquina.",
    status: 422,
  },
  MACHINE_UNAVAILABLE: {
    message: "A máquina não está disponível no período selecionado.",
    status: 409,
  },
  DELIVERY_OUT_OF_RANGE: {
    message:
      "A propriedade de destino está fora do raio de entrega do proprietário para esta máquina. Escolha outra modalidade ou uma propriedade mais próxima.",
    status: 422,
  },
  DESTINATION_DISTANCE_UNKNOWN: {
    message:
      "Não foi possível calcular a distância até a propriedade de destino. Verifique a localização cadastrada.",
    status: 422,
  },
};

export function bookingQuoteErrorResponse(code: BookingQuoteError) {
  const { message, status } = BOOKING_QUOTE_ERROR_RESPONSES[code];
  return apiError(code, message, status);
}
