"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Booking } from "@prisma/client";
import type { z } from "zod";
import { bookingRequestSchema, type BookingRequestInput } from "../schemas/booking.schema";
import type { BookingTotals } from "../lib/pricing";
import { parseErrorOrThrow } from "@/lib/fetch-json";
import { useToast } from "@/components/shared/ToastProvider";

export interface BookingQuotePreview {
  rentalDays: number;
  distanceKm: number;
  isLogisticsEstimate: boolean;
  totals: BookingTotals;
}

export function useCreateBookingRequest(machineId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
      // Todo aluguel nasce em AWAITING_PAYMENT, já ocupando o calendário — o indicador do header
      // precisa refletir isso sem esperar o usuário recarregar a página.
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Aluguel solicitado com sucesso!");
    },
  });
}

// Prévia de valores (sem criar o aluguel) — chamada automaticamente conforme o locatário preenche
// o formulário, para mostrar locação + logística + total antes de "Solicitar aluguel"
// (Context.md §33: tudo que o usuário precisa saber deve ficar claro antes de confirmar).
export function useBookingQuote(machineId: string) {
  return useMutation({
    mutationFn: async (input: z.input<typeof bookingRequestSchema>) => {
      const response = await fetch(`/api/v1/machines/${machineId}/booking-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: BookingQuotePreview };
      return data;
    },
  });
}

export function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/bookings/${bookingId}`, { method: "DELETE" });
      const { data } = (await parseErrorOrThrow(response)) as {
        data: { status: "CANCELLED"; refund: "NOT_APPLICABLE" | "FULL" | "NONE" };
      };
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast(
        "success",
        data.refund === "FULL"
          ? "Aluguel cancelado e pagamento estornado integralmente (simulado)."
          : "Aluguel cancelado com sucesso.",
      );
    },
  });
}

// Ações de acompanhamento pós-pagamento (Context.md §8.9) — mesmo endpoint independente da ação,
// já que advanceBookingFulfillment decide o que é válido a partir do status atual do aluguel.
export function useAdvanceFulfillment(bookingId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (action: string) => {
      const response = await fetch(`/api/v1/bookings/${bookingId}/fulfillment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: { status: string } };
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Andamento do aluguel atualizado.");
    },
  });
}

// Só a contagem (não a lista completa) — usada pelo indicador de "Meus aluguéis" no header, que
// precisa ficar disponível em toda página logada. A lista completa é sempre renderizada no
// servidor por /alugueis, sem passar por aqui.
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
