"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { Property } from "@prisma/client";
import { bookingRequestSchema, type BookingRequestInput } from "../schemas/booking.schema";
import { useCreateBookingRequest } from "../hooks/useBookings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

const LOGISTICS_MODE_LABELS: Record<string, string> = {
  RENTER_PICKUP: "Eu mesmo retiro a máquina",
  OWNER_DELIVERY: "Entrega pelo proprietário",
  PARTNER_TRANSPORT: "Transporte por parceiro",
};

const STATUS_LABELS: Record<string, string> = {
  AWAITING_APPROVAL: "Aguardando aprovação do proprietário",
  APPROVED: "Aprovada — reserva instantânea",
};

interface BookingRequestFormProps {
  machineId: string;
  properties: Pick<Property, "id" | "name" | "city" | "state">[];
}

export function BookingRequestForm({ machineId, properties }: BookingRequestFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);
  const mutation = useCreateBookingRequest(machineId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof bookingRequestSchema>>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: { destinationPropertyId: properties[0]?.id },
  });

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
        <Link href="/perfil" className="font-medium underline">
          minhas reservas
        </Link>{" "}
        assim que essa área estiver disponível.
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

      <FormField label="De" required error={errors.startDate?.message}>
        <Input type="date" {...register("startDate")} />
      </FormField>
      <FormField label="Até" required error={errors.endDate?.message}>
        <Input type="date" {...register("endDate")} />
      </FormField>

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

      <p className="text-xs text-neutral-500">
        O custo de logística e o valor total serão calculados nas próximas etapas da plataforma —
        por enquanto, esta solicitação registra apenas o período e a modalidade escolhidos.
      </p>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Solicitar reserva
      </Button>
    </form>
  );
}
