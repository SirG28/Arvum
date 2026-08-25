"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";

export type ToastTone = "success" | "error" | "info" | "warning";

interface ToastProps {
  tone?: ToastTone;
  children: ReactNode;
  onDismiss: () => void;
  /** true enquanto o ToastProvider aguarda a transição de saída terminar antes de remover da lista. */
  leaving?: boolean;
  /** chamado quando a transição de saída termina — o ToastProvider remove o item da lista aqui. */
  onExited?: () => void;
}

const toneClasses: Record<ToastTone, string> = {
  info: "border-info-500/30 text-info-500",
  success: "border-success-500/30 text-success-500",
  warning: "border-warning-500/30 text-warning-500",
  error: "border-danger-500/30 text-danger-500",
};

const toneIcon: Record<ToastTone, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

// "não-saindo" faz o papel do `open` que useMountTransition espera: o toast já nasce "aberto" e
// pede para fechar quando o ToastProvider marca `leaving`.
export function Toast({ tone = "info", children, onDismiss, leaving = false, onExited }: ToastProps) {
  const { rendered, visible, onTransitionEnd } = useMountTransition(!leaving);

  useEffect(() => {
    if (!rendered) onExited?.();
  }, [rendered, onExited]);

  return (
    <div
      role="status"
      onTransitionEnd={onTransitionEnd}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-white px-4 py-3 text-sm shadow-[var(--shadow-elevation-2)] transition-[opacity,translate] duration-base ease-out",
        visible
          ? "translate-y-0 opacity-100 sm:translate-x-0"
          : "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2",
        toneClasses[tone],
      )}
    >
      <span aria-hidden="true" className="font-bold">
        {toneIcon[tone]}
      </span>
      <p className="flex-1 text-neutral-900">{children}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className="text-neutral-400 hover:text-neutral-700"
      >
        ✕
      </button>
    </div>
  );
}
