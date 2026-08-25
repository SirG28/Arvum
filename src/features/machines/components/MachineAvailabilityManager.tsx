"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { MachineAvailability } from "@prisma/client";
import {
  machineAvailabilitySchema,
  type MachineAvailabilityInput,
} from "../schemas/machine-availability.schema";
import {
  useAddAvailabilityBlock,
  useRemoveAvailabilityBlock,
} from "../hooks/useMachineAvailability";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

interface MachineAvailabilityManagerProps {
  machineId: string;
  blocks: MachineAvailability[];
}

export function MachineAvailabilityManager({
  machineId,
  blocks,
}: MachineAvailabilityManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const addMutation = useAddAvailabilityBlock(machineId);
  const removeMutation = useRemoveAvailabilityBlock(machineId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof machineAvailabilitySchema>>({
    resolver: zodResolver(machineAvailabilitySchema),
  });

  // O zodResolver já entrega startDate/endDate como Date (pós-validação) apesar do tipo estático
  // do formulário ser o shape bruto — ver mesmo comentário em MachineForm.tsx.
  async function onSubmit(rawData: z.input<typeof machineAvailabilitySchema>) {
    const data = rawData as unknown as MachineAvailabilityInput;
    setError(null);
    try {
      await addMutation.mutateAsync(data);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleRemove(blockId: string) {
    setError(null);
    try {
      await removeMutation.mutateAsync(blockId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error" title={error} />}

      {blocks.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum bloqueio de disponibilidade cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              <span>
                {formatDate(block.startDate)} — {formatDate(block.endDate)}
                {block.reason ? ` · ${block.reason}` : ""}
              </span>
              <IconButton
                icon={<TrashIcon />}
                label="Remover bloqueio"
                variant="danger"
                isLoading={removeMutation.isPending}
                onClick={() => handleRemove(block.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        noValidate
      >
        <FormField label="De" required error={errors.startDate?.message}>
          <Input type="date" {...register("startDate")} />
        </FormField>
        <FormField label="Até" required error={errors.endDate?.message}>
          <Input type="date" {...register("endDate")} />
        </FormField>
        <FormField label="Motivo" helpText="Opcional" error={errors.reason?.message}>
          <Input placeholder="Ex.: manutenção programada" {...register("reason")} />
        </FormField>
        <Button type="submit" isLoading={isSubmitting}>
          Bloquear período
        </Button>
      </form>
    </div>
  );
}
