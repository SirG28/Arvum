import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./ChevronDownIcon";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

// `appearance-none` remove a seta nativa (cada navegador desenha a sua, em posição/margem
// diferentes — a raiz da inconsistência entre dropdowns da plataforma) e troca por
// ChevronDownIcon, a mesma seta e margem (right-3, centralizada) usada em todo outro dropdown do
// app (MachineCategoryPicker). `pointer-events-none` no ícone: o clique deve continuar chegando no
// <select> por baixo dele. `peer`/`peer-disabled` sincroniza a cor da seta com o estado desabilitado
// do próprio <select>, sem precisar de JS ou de um wrapper com estado.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError = false, className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={hasError || undefined}
          className={cn(
            "peer block w-full appearance-none rounded-md border bg-white py-2 pr-9 pl-3 text-sm text-neutral-900 shadow-sm transition-colors",
            "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60",
            hasError
              ? "border-danger-500 focus-visible:ring-danger-500"
              : "focus-visible:ring-primary-500 border-neutral-200",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-500 peer-disabled:opacity-60" />
      </div>
    );
  },
);

Select.displayName = "Select";
