"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MachineImageInput } from "../schemas/machine-image.schema";
import { parseErrorOrThrow } from "@/lib/fetch-json";

export function useAddMachineImage(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MachineImageInput) => {
      const response = await fetch(`/api/v1/machines/${machineId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines", machineId] }),
  });
}

export function useRemoveMachineImage(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/v1/machines/${machineId}/images/${imageId}`, {
        method: "DELETE",
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines", machineId] }),
  });
}
