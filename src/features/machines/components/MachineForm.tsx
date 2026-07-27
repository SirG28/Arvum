"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { Machine, MachineCategory, Property } from "@prisma/client";
import {
  machineSchema,
  type MachineFormInput,
  type MachineFormOutput,
} from "../schemas/machine.schema";
import { useCreateMachine, useUpdateMachine } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Nova",
  EXCELLENT: "Excelente",
  GOOD: "Boa",
  FAIR: "Regular",
  NEEDS_MAINTENANCE: "Precisa de manutenção",
};

interface MachineFormProps {
  machine?: Machine;
  properties: Property[];
  categories: MachineCategory[];
}

export function MachineForm({ machine, properties, categories }: MachineFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(machine);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormInput>({
    resolver: zodResolver(machineSchema),
    defaultValues: machine
      ? {
          propertyId: machine.propertyId,
          categoryId: machine.categoryId,
          title: machine.title,
          brand: machine.brand ?? "",
          model: machine.model ?? "",
          manufactureYear: machine.manufactureYear ?? undefined,
          description: machine.description,
          purpose: machine.purpose ?? "",
          recommendedCrops: machine.recommendedCrops.join(", "),
          condition: machine.condition,
          weight: machine.weight ?? undefined,
          width: machine.width ?? undefined,
          height: machine.height ?? undefined,
          length: machine.length ?? undefined,
          requiresOperator: machine.requiresOperator,
          dailyPrice: machine.dailyPriceInCents / 100,
          hourlyPrice: machine.hourlyPriceInCents ? machine.hourlyPriceInCents / 100 : undefined,
          minimumPrice: machine.minimumPriceInCents
            ? machine.minimumPriceInCents / 100
            : undefined,
          deposit: machine.depositInCents ? machine.depositInCents / 100 : undefined,
          minimumRentalDays: machine.minimumRentalDays,
          maximumRentalDays: machine.maximumRentalDays ?? undefined,
          instantBooking: machine.instantBooking,
          deliveryRadiusKm: machine.deliveryRadiusKm ?? undefined,
        }
      : { minimumRentalDays: 1 },
  });

  const createMutation = useCreateMachine();
  const updateMutation = useUpdateMachine(machine?.id ?? "");

  // O zodResolver já entrega os dados transformados/validados (recommendedCrops como array,
  // preços como number etc.) apesar do tipo estático de `register`/defaultValues ser o shape
  // bruto do formulário — react-hook-form não expõe um terceiro genérico compatível com esta
  // versão do @hookform/resolvers para refletir isso no tipo do callback.
  async function onSubmit(rawData: MachineFormInput) {
    const data = rawData as unknown as MachineFormOutput;
    setSubmitError(null);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push("/maquinas");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {submitError && <Alert tone="error" title={submitError} />}

      <FormField label="Nome do anúncio" required error={errors.title?.message}>
        <Input placeholder="Ex.: Trator Massey Ferguson 275" {...register("title")} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Propriedade" required error={errors.propertyId?.message}>
          <Select {...register("propertyId")}>
            <option value="">Selecione</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Categoria" required error={errors.categoryId?.message}>
          <Select {...register("categoryId")}>
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Marca" helpText="Opcional" error={errors.brand?.message}>
          <Input {...register("brand")} />
        </FormField>
        <FormField label="Modelo" helpText="Opcional" error={errors.model?.message}>
          <Input {...register("model")} />
        </FormField>
        <FormField label="Ano" helpText="Opcional" error={errors.manufactureYear?.message}>
          <Input type="number" {...register("manufactureYear")} />
        </FormField>
      </div>

      <FormField label="Descrição" required error={errors.description?.message}>
        <Textarea
          placeholder="Descreva o estado, o uso recomendado e os diferenciais da máquina."
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Finalidade" helpText="Opcional" error={errors.purpose?.message}>
          <Input placeholder="Ex.: preparo de solo" {...register("purpose")} />
        </FormField>
        <FormField
          label="Culturas recomendadas"
          helpText="Opcional — separadas por vírgula"
          error={errors.recommendedCrops?.message as string | undefined}
        >
          <Input placeholder="Ex.: soja, milho" {...register("recommendedCrops")} />
        </FormField>
      </div>

      <FormField label="Condição do equipamento" required error={errors.condition?.message}>
        <Select {...register("condition")}>
          <option value="">Selecione</option>
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-4 gap-4">
        <FormField label="Peso (kg)" helpText="Opcional" error={errors.weight?.message}>
          <Input type="number" step="0.01" {...register("weight")} />
        </FormField>
        <FormField label="Largura (m)" helpText="Opcional" error={errors.width?.message}>
          <Input type="number" step="0.01" {...register("width")} />
        </FormField>
        <FormField label="Altura (m)" helpText="Opcional" error={errors.height?.message}>
          <Input type="number" step="0.01" {...register("height")} />
        </FormField>
        <FormField label="Comprimento (m)" helpText="Opcional" error={errors.length?.message}>
          <Input type="number" step="0.01" {...register("length")} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          {...register("requiresOperator")}
        />
        Requer operador
      </label>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Diária (R$)" required error={errors.dailyPrice?.message}>
          <Input type="number" step="0.01" {...register("dailyPrice")} />
        </FormField>
        <FormField
          label="Valor por hora (R$)"
          helpText="Opcional"
          error={errors.hourlyPrice?.message}
        >
          <Input type="number" step="0.01" {...register("hourlyPrice")} />
        </FormField>
        <FormField
          label="Valor mínimo de locação (R$)"
          helpText="Opcional"
          error={errors.minimumPrice?.message}
        >
          <Input type="number" step="0.01" {...register("minimumPrice")} />
        </FormField>
        <FormField label="Caução (R$)" helpText="Opcional" error={errors.deposit?.message}>
          <Input type="number" step="0.01" {...register("deposit")} />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Duração mínima (dias)" error={errors.minimumRentalDays?.message}>
          <Input type="number" {...register("minimumRentalDays")} />
        </FormField>
        <FormField
          label="Duração máxima (dias)"
          helpText="Opcional"
          error={errors.maximumRentalDays?.message}
        >
          <Input type="number" {...register("maximumRentalDays")} />
        </FormField>
        <FormField
          label="Raio de atendimento (km)"
          helpText="Opcional"
          error={errors.deliveryRadiusKm?.message}
        >
          <Input type="number" step="0.1" {...register("deliveryRadiusKm")} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          {...register("instantBooking")}
        />
        Permitir reserva instantânea (sem aprovação manual do proprietário)
      </label>

      <Button type="submit" isLoading={isSubmitting}>
        {isEditing ? "Salvar alterações" : "Cadastrar máquina"}
      </Button>
    </form>
  );
}
