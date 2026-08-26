"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { Property } from "@prisma/client";
import { bookingRequestSchema, type BookingRequestInput } from "../schemas/booking.schema";
import { useCreateBookingRequest, useBookingQuote } from "../hooks/useBookings";
import { LOGISTICS_MODE_LABELS } from "../lib/logistics-labels";
import { PriceBreakdown } from "./PriceBreakdown";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const STATUS_LABELS: Record<string, string> = {
  AWAITING_APPROVAL: "Aguardando aprovação do proprietário",
  APPROVED: "Aprovada — reserva instantânea",
};

const QUOTE_DEBOUNCE_MS = 500;

interface BookingRequestFormProps {
  machineId: string;
  properties: Pick<Property, "id" | "name" | "city" | "state">[];
}

export function BookingRequestForm({ machineId, properties }: BookingRequestFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);
  const mutation = useCreateBookingRequest(machineId);
  const quote = useBookingQuote(machineId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof bookingRequestSchema>>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: { destinationPropertyId: properties[0]?.id },
  });

  const destinationPropertyId = watch("destinationPropertyId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const logisticsMode = watch("logisticsMode");

  // Prévia automática de valores conforme o locatário preenche o formulário (Context.md §33:
  // tudo que o usuário precisa saber deve ficar claro antes de solicitar) — debounced para não
  // disparar uma chamada a cada tecla digitada, e só quando os 4 campos necessários ao cálculo
  // (destino, período, modalidade) já são válidos o bastante para tentar.
  useEffect(() => {
    if (!destinationPropertyId || !startDate || !endDate || !logisticsMode) {
      quote.reset();
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      quote.reset();
      return;
    }

    const timeoutId = setTimeout(() => {
      quote.mutate({ destinationPropertyId, startDate, endDate, logisticsMode });
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationPropertyId, startDate, endDate, logisticsMode]);

  // O zodResolver já entrega startDate/endDate como Date (pós-validação) apesar do tipo estático
  // do formulário ser o shape bruto — mesmo padrão de MachineAvailabilityManager.tsx.
  async function onSubmit(rawData: z.input<typeof bookingRequestSchema>) {
    const data = rawData as unknown as BookingRequestInput;
    setError(null);
    try {
      const booking = await mutation.mutateAsync(data);
      setConfirmedStatus(booking.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  if (confirmedStatus) {
    return (
      <Alert tone="success" title="Solicitação enviada">
        {STATUS_LABELS[confirmedStatus] ?? confirmedStatus}. Acompanhe o andamento em{" "}
        <Link href="/reservas" className="font-medium underline">
          minhas reservas
        </Link>
        .
      </Alert>
    );
  }

  if (properties.length === 0) {
    return (
      <Alert tone="warning" title="Cadastre uma propriedade antes de reservar">
        Você precisa de uma propriedade de destino para receber a máquina.{" "}
        <Link href="/propriedades/nova" className="font-medium underline">
          Cadastrar propriedade
        </Link>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      {error && <Alert tone="error" title={error} />}

      <FormField label="Propriedade de destino" required error={errors.destinationPropertyId?.message}>
        <Select {...register("destinationPropertyId")}>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} — {property.city}/{property.state}
            </option>
          ))}
        </Select>
      </FormField>

      {/* O resolver do RHF entrega startDate/endDate como Date pós-validação, mas o input nativo
          (e este DateRangePicker) sempre trabalha com string "yyyy-mm-dd" — mesma inconsistência
          de tipo estático já existente neste formulário (ver comentário no onSubmit abaixo). */}
      <DateRangePicker
        label="Período da locação"
        value={{
          startDate: (startDate as unknown as string) ?? "",
          endDate: (endDate as unknown as string) ?? "",
        }}
        onChange={(range) => {
          setValue("startDate", range.startDate as unknown as Date, { shouldValidate: true });
          setValue("endDate", range.endDate as unknown as Date, { shouldValidate: true });
        }}
        error={errors.startDate?.message ?? errors.endDate?.message}
      />

      <FormField label="Como retirar/receber" required error={errors.logisticsMode?.message}>
        <Select {...register("logisticsMode")} defaultValue="">
          <option value="" disabled>
            Selecione uma opção
          </option>
          {Object.entries(LOGISTICS_MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Observações" helpText="Opcional" error={errors.notes?.message}>
        <Textarea rows={3} placeholder="Alguma informação para o proprietário?" {...register("notes")} />
      </FormField>

      {quote.isPending && (
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
          <Spinner size="sm" />
          Calculando valores...
        </div>
      )}

      {quote.isError && (
        <Alert tone="warning" title="Não foi possível calcular os valores">
          {quote.error instanceof Error ? quote.error.message : "Erro inesperado."}
        </Alert>
      )}

      {quote.isSuccess && (
        <div className="animate-fade-slide-in rounded-md border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Valores estimados</h3>
          <PriceBreakdown
            className="mt-3"
            rentalValueInCents={quote.data.totals.rentalValueInCents}
            logisticsValueInCents={quote.data.totals.logisticsValueInCents}
            serviceFeeInCents={quote.data.totals.serviceFeeInCents}
            depositInCents={quote.data.totals.depositInCents}
            discountInCents={quote.data.totals.discountInCents}
            totalValueInCents={quote.data.totals.totalValueInCents}
            distanceKm={quote.data.distanceKm}
            footnote="A taxa de serviço ainda é calculada como zero — chega nas próximas etapas da plataforma. Estes valores podem ser recalculados na confirmação."
          />
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Solicitar reserva
      </Button>
    </form>
  );
}
