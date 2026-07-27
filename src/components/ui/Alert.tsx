import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "error";

interface AlertProps {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  info: "border-info-500/30 bg-info-500/5 text-info-500",
  success: "border-success-500/30 bg-success-500/5 text-success-500",
  warning: "border-warning-500/30 bg-warning-500/5 text-warning-500",
  error: "border-danger-500/30 bg-danger-500/5 text-danger-500",
};

const toneIcon: Record<Tone, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", toneClasses[tone], className)}
    >
      <span aria-hidden="true" className="font-bold">
        {toneIcon[tone]}
      </span>
      <div className="text-neutral-900">
        <p className="font-medium">{title}</p>
        {children && <div className="mt-1 text-neutral-700">{children}</div>}
      </div>
    </div>
  );
}
