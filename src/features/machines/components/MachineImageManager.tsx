"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { MachineImage } from "@prisma/client";
import { resizeImageToDataUrl } from "../lib/image-file";
import { useAddMachineImage, useRemoveMachineImage } from "../hooks/useMachineImages";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/PlusIcon";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { Alert } from "@/components/ui/Alert";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

interface MachineImageManagerProps {
  machineId: string;
  images: MachineImage[];
}

export function MachineImageManager({ machineId, images }: MachineImageManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Id da imagem com remoção pendente de confirmação — nunca mais de uma por vez, então um único
  // ConfirmationDialog (abaixo) atende qualquer miniatura da grade.
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMutation = useAddMachineImage(machineId);
  const removeMutation = useRemoveMachineImage(machineId);

  // Sem provedor de storage configurado neste projeto (Context.md/BUSINESS_RULES.md) — a imagem
  // escolhida no seletor nativo do sistema (arquivos do computador ou galeria/câmera do celular)
  // vira um data URL já redimensionado (resizeImageToDataUrl) e é enviada como MachineImage.url,
  // o mesmo campo que antes recebia uma URL colada manualmente. Some o campo de texto alternativo
  // manual: o alt já cai de volta pro nome do anúncio em todo lugar que renderiza a imagem.
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpa o valor do input já aqui — sem isso, escolher o mesmo arquivo de novo (ex.: depois de
    // corrigir um erro) não dispara um novo evento "change".
    event.target.value = "";
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await addMutation.mutateAsync({ url: dataUrl });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar a imagem.");
    } finally {
      setIsProcessing(false);
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
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo proprietário, sem provedor de storage/otimização configurado */}
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      <Button
        type="button"
        isLoading={isProcessing}
        onClick={() => fileInputRef.current?.click()}
        className="self-start"
      >
        <PlusIcon />
        Adicionar imagem
      </Button>
    </div>
  );
}
