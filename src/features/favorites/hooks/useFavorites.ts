"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseErrorOrThrow } from "@/lib/fetch-json";

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (machineId: string) => {
      const response = await fetch("/api/v1/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId }),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (machineId: string) => {
      const response = await fetch(`/api/v1/favorites/${machineId}`, { method: "DELETE" });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
