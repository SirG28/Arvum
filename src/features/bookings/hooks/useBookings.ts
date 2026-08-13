"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Booking } from "@prisma/client";
import type { z } from "zod";
import { bookingRequestSchema, type BookingRequestInput } from "../schemas/booking.schema";
import type { BookingTotals } from "../lib/pricing";
import { parseErrorOrThrow } from "./fetch-json";
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
      // Nova reserva sempre nasce em status "aberto" (AWAITING_APPROVAL/APPROVED) — o indicador
      // do header precisa refletir isso sem esperar o usuário recarregar a página.
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Solicitação de reserva enviada com sucesso!");
    },
  });
}

// Prévia de valores (sem criar reserva) — chamada automaticamente conforme o locatário preenche
// o formulário, para mostrar locação + logística + total antes de "Solicitar reserva"
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
      return parseErrorOrThrow(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", "Reserva cancelada com sucesso.");
    },
  });
}

export function useDecideBooking(bookingId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (input: { decision: "APPROVED" | "REJECTED"; reason?: string }) => {
      const response = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const { data } = (await parseErrorOrThrow(response)) as { data: { status: string } };
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "open-count"] });
      showToast("success", data.status === "APPROVED" ? "Solicitação aprovada." : "Solicitação recusada.");
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
