import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-neutral-900", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-danger-500">
          {" "}
          *
        </span>
      )}
    </label>
  );
}
