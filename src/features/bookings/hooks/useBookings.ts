"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Booking } from "@prisma/client";
import type { BookingRequestInput } from "../schemas/booking.schema";
import { parseErrorOrThrow } from "./fetch-json";

export function useCreateBookingRequest(machineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookingRequestInput) => {
      const response = await fetch(`/api/v1/machines/${machineId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: Booking };
      return data;
    },
    onSuccess: () => {
      // Nova reserva sempre nasce em status "aberto" (AWAITING_APPROVAL/APPROVED) — o indicador
      // do header precisa refletir isso sem esperar o usuário recarregar a página.
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
    },
  });
}

// Só a contagem (não a lista completa) — usada pelo indicador de "Minhas reservas" no header,
// que precisa ficar disponível em toda página logada. A lista completa é sempre renderizada no
// servidor por /reservas, sem passar por aqui.
export function useOpenBookingsCount(enabled: boolean) {
  return useQuery({
    queryKey: ["bookings", "open-count"],
    queryFn: async () => {
      const response = await fetch("/api/v1/bookings/open-count");
      const { data } = (await parseErrorOrThrow(response)) as { data: { count: number } };
      return data.count;
    },
    enabled,
  });
}
