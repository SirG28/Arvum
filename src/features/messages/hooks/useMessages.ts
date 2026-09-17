"use client";

import { useMutation } from "@tanstack/react-query";
import type { Message } from "@prisma/client";
import type { SendMessageInput } from "../schemas/message.schema";
import { parseErrorOrThrow } from "@/lib/fetch-json";

// Sem toast de sucesso (diferente de useCreateReview/useCancelBooking): mensagem é uma ação
// frequente numa conversa, um aviso a cada envio seria ruído — a própria mensagem aparecendo na
// lista (router.refresh() em MessageForm) já confirma o envio.
export function useSendMessage(bookingId: string) {
  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      const response = await fetch(`/api/v1/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: Message };
      return data;
    },
  });
}
