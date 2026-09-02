"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Machine, MachineStatus } from "@prisma/client";
import type { MachineFormOutput } from "../schemas/machine.schema";
import { parseErrorOrThrow } from "@/lib/fetch-json";

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MachineFormOutput & { images?: string[] }) => {
      const response = await fetch("/api/v1/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: Machine };
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
}

export function useUpdateMachine(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MachineFormOutput) => {
      const response = await fetch(`/api/v1/machines/${machineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (machineId: string) => {
      const response = await fetch(`/api/v1/machines/${machineId}`, { method: "DELETE" });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
}

export function useChangeMachineStatus(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: MachineStatus) => {
      const response = await fetch(`/api/v1/machines/${machineId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return parseErrorOrThrow(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
}
