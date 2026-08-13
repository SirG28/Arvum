import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info" | "warning";

interface ToastProps {
  tone?: ToastTone;
  children: ReactNode;
  onDismiss: () => void;
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

export function Toast({ tone = "info", children, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-white px-4 py-3 text-sm shadow-[var(--shadow-elevation-2)]",
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
