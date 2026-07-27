import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError = false, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          "block w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors",
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
    );
  },
);

Select.displayName = "Select";
