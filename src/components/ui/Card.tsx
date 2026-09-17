import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "primary";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Tinge fundo/borda com a paleta de marca — opt-in, usado em contexto de marketing (home),
   * nunca no default, para não mudar a aparência das dezenas de usos transacionais existentes. */
  tone?: Tone;
  /** Eleva sutilmente no hover (translateY + sombra), mesmo padrão já usado em CatalogMachineCard. */
  hoverable?: boolean;
}

const toneClasses: Record<Tone, string> = {
  default: "border-neutral-200 bg-white",
  primary: "border-primary-200 bg-primary-50",
};

export function Card({ className, tone = "default", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-[var(--shadow-elevation-1)]",
        toneClasses[tone],
        hoverable &&
          "transition-[transform,box-shadow] duration-fast ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]",
        className,
      )}
      {...props}
    />
  );
}
