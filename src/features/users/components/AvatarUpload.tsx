"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// 1,5 MB de arquivo original — em base64 (que infla o tamanho em ~33%) fica perto do limite de
// 2,5M caracteres validado no servidor (profile.schema.ts), com folga para o prefixo "data:...".
const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024;

interface AvatarUploadProps {
  name: string;
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}

// Sem provedor de armazenamento de imagens configurado neste projeto (mesma limitação documentada
// para as imagens de máquina — BUSINESS_RULES.md), então a foto é lida direto do arquivo
// selecionado (input[type=file], que no celular já oferece "Câmera"/"Galeria" nativamente) e
// guardada como data URL no próprio campo avatarUrl — uma foto de perfil é pequena o bastante
// para isso ser uma solução real, não uma simulação apresentada como concluída (Context.md §27).
export function AvatarUpload({ name, value, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("A imagem deve ter no máximo 1,5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.onerror = () => setError("Não foi possível ler a imagem. Tente outro arquivo.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <div className="flex items-center gap-4">
        <Avatar src={value} name={name} size="lg" />
        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            {value ? "Trocar foto" : "Adicionar foto"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs font-medium text-danger-500 hover:underline"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-400">JPG ou PNG, até 1,5 MB.</p>
    </div>
  );
}
