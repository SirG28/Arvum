import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError = false, className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
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

Textarea.displayName = "Textarea";
