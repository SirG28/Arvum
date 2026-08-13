"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Payment } from "@prisma/client";
import type { PaymentRequestInput } from "../schemas/payment.schema";
import { parseErrorOrThrow } from "./fetch-json";
import { useToast } from "@/components/shared/ToastProvider";

export function useConfirmPayment(bookingId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: PaymentRequestInput) => {
      const response = await fetch(`/api/v1/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: Payment };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Pagamento confirmado com sucesso!");
    },
  });
}
