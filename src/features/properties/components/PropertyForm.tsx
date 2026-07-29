"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { Property } from "@prisma/client";
import { propertySchema, type PropertyInput } from "../schemas/property.schema";
import { useCreateProperty, useUpdateProperty } from "../hooks/useProperties";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

interface PropertyFormProps {
  property?: Property;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(property);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          name: property.name,
          addressLine: property.addressLine,
          number: property.number ?? "",
          complement: property.complement ?? "",
          district: property.district ?? "",
          city: property.city,
          state: property.state,
          postalCode: property.postalCode,
          accessNotes: property.accessNotes ?? "",
          roadType: property.roadType ?? "",
        }
      : undefined,
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty(property?.id ?? "");

  async function onSubmit(data: PropertyInput) {
    setSubmitError(null);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push("/propriedades");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {submitError && <Alert tone="error" title={submitError} />}

      <FormField label="Nome da propriedade" required error={errors.name?.message}>
        <Input placeholder="Ex.: Fazenda Santa Rita" {...register("name")} />
      </FormField>

      <FormField label="Endereço" required error={errors.addressLine?.message}>
        <Input placeholder="Estrada, rodovia ou logradouro" {...register("addressLine")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Número" error={errors.number?.message}>
          <Input {...register("number")} />
        </FormField>
        <FormField label="Complemento" error={errors.complement?.message}>
          <Input {...register("complement")} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Cidade" required error={errors.city?.message}>
          <Input {...register("city")} />
        </FormField>
        <FormField label="UF" required error={errors.state?.message}>
          <Input maxLength={2} placeholder="SP" {...register("state")} />
        </FormField>
        <FormField label="CEP" required error={errors.postalCode?.message}>
          <Input placeholder="00000-000" {...register("postalCode")} />
        </FormField>
      </div>

      <FormField label="Tipo de estrada" helpText="Opcional" error={errors.roadType?.message}>
        <Input placeholder="Ex.: asfaltada, terra" {...register("roadType")} />
      </FormField>

      <FormField
        label="Observações logísticas"
        helpText="Opcional — referências de acesso, restrições etc."
        error={errors.accessNotes?.message}
      >
        <Input {...register("accessNotes")} />
      </FormField>

      <Button type="submit" isLoading={isSubmitting}>
        {isEditing ? "Salvar alterações" : "Cadastrar propriedade"}
      </Button>
    </form>
  );
}
