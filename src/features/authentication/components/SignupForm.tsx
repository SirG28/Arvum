"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupActionState } from "../actions/signup.action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

const initialState: SignupActionState = { success: false };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  // Inputs não controlados são resetados pelo React ao fim de uma Server Action; usamos
  // `submittedAt` como key para forçar o remount com os valores devolvidos pela action
  // (senha nunca é reenviada, então esse campo sempre volta vazio de propósito).
  const formKey = state.submittedAt ?? "initial";

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.errors && Object.keys(state.errors).length > 0 && !state.errors.email && (
        <Alert tone="error" title="Verifique os campos destacados abaixo." />
      )}

      <FormField label="Nome completo" required error={state.errors?.name?.[0]}>
        <Input key={`name-${formKey}`} name="name" autoComplete="name" defaultValue={state.values?.name} />
      </FormField>

      <FormField label="E-mail" required error={state.errors?.email?.[0]}>
        <Input
          key={`email-${formKey}`}
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.values?.email}
        />
      </FormField>

      <FormField label="Telefone" helpText="Opcional" error={state.errors?.phone?.[0]}>
        <Input
          key={`phone-${formKey}`}
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          defaultValue={state.values?.phone}
        />
      </FormField>

      <FormField
        label="Senha"
        required
        helpText="Mínimo de 8 caracteres, com letra maiúscula e número."
        error={state.errors?.password?.[0]}
      >
        <PasswordInput name="password" autoComplete="new-password" />
      </FormField>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input
          key={`terms-${formKey}`}
          type="checkbox"
          name="acceptedTerms"
          defaultChecked={state.values?.acceptedTerms}
          className="mt-1"
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos-de-uso" target="_blank" className="text-primary-700 underline">
            termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/politica-de-privacidade" target="_blank" className="text-primary-700 underline">
            política de privacidade
          </Link>
          .
        </span>
      </label>
      {state.errors?.acceptedTerms?.[0] && (
        <p role="alert" className="text-xs font-medium text-danger-500">
          {state.errors.acceptedTerms[0]}
        </p>
      )}

      <Button type="submit" isLoading={isPending}>
        Criar conta
      </Button>
    </form>
  );
}
