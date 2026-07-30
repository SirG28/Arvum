"use client";

import { useMutation } from "@tanstack/react-query";
import type { Booking } from "@prisma/client";
import type { BookingRequestInput } from "../schemas/booking.schema";
import { parseErrorOrThrow } from "./fetch-json";

export function useCreateBookingRequest(machineId: string) {
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
  });
}
