import type { ReactNode } from "react";
import { useId } from "react";
import { cloneElement, isValidElement } from "react";
import { Label } from "./Label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, helpText, error, children }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const describedBy =
    [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: fieldId,
        "aria-describedby": describedBy,
        hasError: Boolean(error),
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      {control}
      {helpText && !error && (
        <p id={helpId} className="text-xs text-neutral-500">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-danger-500 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
