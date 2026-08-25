import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type IconButtonVariant = "neutral" | "danger";

// Classes compartilhadas entre o <button> abaixo e usos como link estilizado (ex.: "editar", que
// navega em vez de disparar uma ação — ver PropertyCard.tsx) — um único lugar define a aparência
// do ícone compacto.
export function iconButtonClassName(variant: IconButtonVariant = "neutral", className?: string) {
  return cn(
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white transition-colors",
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variant === "danger"
      ? "border-danger-500/30 text-danger-500 hover:bg-danger-500/10 focus-visible:ring-danger-500"
      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-500",
    className,
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  isLoading?: boolean;
}

// Reservado para ações repetidas em contexto compacto (linha de lista, grade de imagens) com
// significado universalmente reconhecível (editar, remover) — nunca para a ação principal de uma
// tela, nem para ações raras ou de alto impacto, onde o texto continua mais claro (Context.md §6:
// simplicidade para usuários com diferentes níveis de familiaridade digital). `label` é
// obrigatório e vira aria-label + tooltip (title) — o ícone nunca fica sem descrição textual para
// quem usa leitor de tela ou não reconhece o glifo.
export function IconButton({
  icon,
  label,
  variant = "neutral",
  isLoading = false,
  disabled,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={iconButtonClassName(variant, className)}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : icon}
    </button>
  );
}
