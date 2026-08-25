"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@prisma/client";
import type { ReviewRequestInput } from "../schemas/review.schema";
import { parseErrorOrThrow } from "./fetch-json";
import { useToast } from "@/components/shared/ToastProvider";

export function useCreateReview(bookingId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: ReviewRequestInput) => {
      const response = await fetch(`/api/v1/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: Review };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Avaliação enviada com sucesso!");
    },
  });
}
