import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          "block w-full rounded-md border px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors",
          "placeholder:text-neutral-400",
          "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60",
          hasError
            ? "border-danger-500 focus-visible:ring-danger-500"
            : "focus-visible:ring-primary-500 border-neutral-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
