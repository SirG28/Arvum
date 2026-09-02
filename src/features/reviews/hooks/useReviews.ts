"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@prisma/client";
import type { ReviewRequestInput, ReportReviewInput } from "../schemas/review.schema";
import { parseErrorOrThrow } from "@/lib/fetch-json";
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

export function useReportReview(reviewId: string) {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: ReportReviewInput) => {
      const response = await fetch(`/api/v1/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => {
      showToast("success", "Denúncia enviada — nossa equipe vai revisar.");
    },
  });
}

export function useModerateReview(reviewId: string) {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (decision: "HIDE" | "RESTORE") => {
      const response = await fetch(`/api/v1/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: (_data, decision) => {
      showToast(
        "success",
        decision === "HIDE" ? "Avaliação ocultada." : "Denúncia descartada — avaliação mantida.",
      );
    },
  });
}
