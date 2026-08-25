"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Input } from "./Input";
import { EyeIcon } from "./EyeIcon";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

// Compõe o Input (não duplica borda/foco/erro) e adiciona um botão de mostrar/ocultar senha.
// Aceita hasError/id/aria-describedby como filho direto de FormField (ver FormField.tsx) e
// repassa a ref para o <input> real, necessário para o register() do React Hook Form.
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, hasError, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          hasError={hasError}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          className={cn(
            "absolute inset-y-0 right-0 my-auto flex h-11 w-11 items-center justify-center rounded-md text-neutral-400",
            "hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
          )}
        >
          <EyeIcon visible={visible} className="h-4.5 w-4.5" />
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
