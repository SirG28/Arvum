import { cn } from "@/lib/cn";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

// Estrela cheia/vazia usa glifos diferentes, não só cor (Context.md §13: não depender apenas de
// cor para comunicar estado). Modo interativo (onChange informado) vira um radiogroup acessível
// por teclado; modo somente leitura é decorativo (aria-hidden), com o valor numérico exposto pelo
// componente que o utiliza — nunca só a estrela para quem usa leitor de tela.
export function Rating({ value, onChange, max = 5, size = "md", className, label }: RatingProps) {
  const interactive = Boolean(onChange);
  const sizeClass = size === "sm" ? "text-base" : "text-xl";

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", sizeClass, className)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? (label ?? "Nota") : undefined}
      aria-hidden={interactive ? undefined : true}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= Math.round(value);

        if (!interactive) {
          return (
            <span key={starValue} className={filled ? "text-accent-500" : "text-neutral-300"}>
              {filled ? "★" : "☆"}
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} de ${max}`}
            onClick={() => onChange?.(starValue)}
            className={cn(
              "rounded-sm leading-none transition-colors",
              "focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
              filled ? "text-accent-500" : "text-neutral-300 hover:text-accent-300",
            )}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
