"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseErrorOrThrow } from "@/features/bookings/hooks/fetch-json";
import { useToast } from "@/components/shared/ToastProvider";

export function useSubscribeToPremium() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/subscriptions", { method: "POST" });
      await parseErrorOrThrow(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      showToast("success", "Plano Premium ativado com sucesso!");
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/subscriptions", { method: "DELETE" });
      await parseErrorOrThrow(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      showToast("success", "Assinatura cancelada. Os benefícios continuam até o fim do período pago.");
    },
  });
}
