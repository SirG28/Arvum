"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { useSendMessage } from "../hooks/useMessages";
import { cn } from "@/lib/cn";

interface MessageFormProps {
  bookingId: string;
  className?: string;
}

export function MessageForm({ bookingId, className }: MessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useSendMessage(bookingId);

  async function handleSubmit() {
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Escreva uma mensagem antes de enviar.");
      return;
    }
    try {
      await mutation.mutateAsync({ body: trimmed });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {error && <Alert tone="error" title={error} />}
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={2}
        placeholder="Escreva uma mensagem..."
      />
      <Button className="self-end" isLoading={mutation.isPending} onClick={handleSubmit}>
        Enviar
      </Button>
    </div>
  );
}
