"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MachineImage } from "@prisma/client";
import { machineImageSchema, type MachineImageInput } from "../schemas/machine-image.schema";
import { useAddMachineImage, useRemoveMachineImage } from "../hooks/useMachineImages";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/PlusIcon";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

interface MachineImageManagerProps {
  machineId: string;
  images: MachineImage[];
}

export function MachineImageManager({ machineId, images }: MachineImageManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Id da imagem com remoção pendente de confirmação — nunca mais de uma por vez, então um único
  // ConfirmationDialog (abaixo) atende qualquer miniatura da grade.
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const addMutation = useAddMachineImage(machineId);
  const removeMutation = useRemoveMachineImage(machineId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineImageInput>({ resolver: zodResolver(machineImageSchema) });

  async function onSubmit(data: MachineImageInput) {
    setError(null);
    try {
      await addMutation.mutateAsync(data);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleConfirmRemove() {
    if (!pendingRemovalId) return;
    setError(null);
    try {
      await removeMutation.mutateAsync(pendingRemovalId);
      setPendingRemovalId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setPendingRemovalId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error" title={error} />}

      {images.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma imagem cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado */}
              <img
                src={image.url}
                alt={image.altText ?? ""}
                className="aspect-square w-full rounded-md border border-neutral-200 object-cover"
              />
              <IconButton
                icon={<TrashIcon />}
                label="Remover imagem"
                variant="danger"
                onClick={() => setPendingRemovalId(image.id)}
                className="absolute top-2 right-2 shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={pendingRemovalId !== null}
        title="Remover esta imagem?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Sim, remover imagem"
        cancelLabel="Cancelar"
        tone="danger"
        isLoading={removeMutation.isPending}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemovalId(null)}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        noValidate
      >
        <div className="flex-1">
          <FormField label="URL da imagem" required error={errors.url?.message}>
            <Input placeholder="https://..." {...register("url")} />
          </FormField>
        </div>
        <FormField label="Texto alternativo" helpText="Opcional" error={errors.altText?.message}>
          <Input {...register("altText")} />
        </FormField>
        <Button type="submit" isLoading={isSubmitting}>
          <PlusIcon />
          Adicionar imagem
        </Button>
      </form>
    </div>
  );
}
