"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PropertyInput } from "../schemas/property.schema";

interface ApiErrorBody {
  error: { code: string; message: string };
}

async function parseErrorOrThrow(response: Response) {
  if (response.ok) return response.json();
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  throw new Error(body?.error?.message ?? "Não foi possível concluir a operação.");
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PropertyInput) => {
      const response = await fetch("/api/v1/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });
}

export function useUpdateProperty(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PropertyInput) => {
      const response = await fetch(`/api/v1/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/v1/properties/${propertyId}`, { method: "DELETE" });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });
}
