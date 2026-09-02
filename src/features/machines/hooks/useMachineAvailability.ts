"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MachineAvailabilityInput } from "../schemas/machine-availability.schema";
import { parseErrorOrThrow } from "@/lib/fetch-json";

export function useAddAvailabilityBlock(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MachineAvailabilityInput) => {
      const response = await fetch(`/api/v1/machines/${machineId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines", machineId] }),
  });
}

export function useRemoveAvailabilityBlock(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const response = await fetch(`/api/v1/machines/${machineId}/availability/${blockId}`, {
        method: "DELETE",
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines", machineId] }),
  });
}
