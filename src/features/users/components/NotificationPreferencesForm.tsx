"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Alert } from "@/components/ui/Alert";
import { useUpdateNotificationPreferences } from "../hooks/useUsers";

interface NotificationPreferencesFormProps {
  notifyByEmail: boolean;
}

// Só um canal por enquanto (Context.md §8.16 prevê mais: push, SMS/WhatsApp — tudo "futuramente").
// A preferência já é salva de verdade no banco, mas nenhum e-mail é disparado ainda — não existe
// sistema de envio (Fase 5). O texto do checkbox deixa isso claro, para não parecer uma
// funcionalidade concluída que não é (Context.md §27).
export function NotificationPreferencesForm({ notifyByEmail }: NotificationPreferencesFormProps) {
  const [checked, setChecked] = useState(notifyByEmail);
  const [error, setError] = useState<string | null>(null);
  const mutation = useUpdateNotificationPreferences();

  async function handleChange(value: boolean) {
    setChecked(value);
    setError(null);
    try {
      await mutation.mutateAsync({ notifyByEmail: value });
    } catch (err) {
      setChecked(!value);
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error" title={error} />}
      <Checkbox
        id="notifyByEmail"
        label="Receber notificações por e-mail sobre minhas reservas e anúncios"
        checked={checked}
        disabled={mutation.isPending}
        onChange={(event) => handleChange(event.target.checked)}
      />
      <p className="text-xs text-neutral-400">
        O envio de e-mails ainda não está ativo na plataforma — sua preferência fica salva e será
        respeitada assim que estiver disponível.
      </p>
    </div>
  );
}
