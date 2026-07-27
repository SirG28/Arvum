import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-success-500/10 text-success-500",
  warning: "bg-warning-500/10 text-warning-500",
  danger: "bg-danger-500/10 text-danger-500",
  info: "bg-info-500/10 text-info-500",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
