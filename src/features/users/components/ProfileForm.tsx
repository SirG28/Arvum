"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { User } from "@prisma/client";
import { profileSchema, type ProfileInput } from "../schemas/profile.schema";
import { useUpdateProfile } from "../hooks/useUsers";
import { AvatarUpload } from "./AvatarUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

const DOCUMENT_TYPE_LABELS: Record<string, string> = { CPF: "CPF", CNPJ: "CNPJ" };

interface ProfileFormProps {
  user: Pick<User, "name" | "email" | "phone" | "documentType" | "documentNumber" | "avatarUrl">;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      documentType: user.documentType ?? undefined,
      documentNumber: user.documentNumber ?? "",
      avatarUrl: user.avatarUrl ?? "",
    },
  });

  const name = watch("name");
  const avatarUrl = watch("avatarUrl");

  async function onSubmit(data: ProfileInput) {
    setSubmitError(null);
    try {
      await updateMutation.mutateAsync(data);
      // A sessão JWT não é revalidada contra o banco a cada requisição — sem isto, o nome no
      // cabeçalho ficaria desatualizado até um novo login (ver comentário em src/auth.ts).
      await update({ name: data.name });
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {submitError && <Alert tone="error" title={submitError} />}

      <FormField label="Foto de perfil" error={errors.avatarUrl?.message}>
        <AvatarUpload
          name={name || user.name}
          value={avatarUrl || undefined}
          onChange={(dataUrl) => setValue("avatarUrl", dataUrl, { shouldDirty: true })}
        />
      </FormField>

      <FormField label="Nome completo" required error={errors.name?.message}>
        <Input {...register("name")} />
      </FormField>

      <FormField label="Telefone" helpText="Opcional" error={errors.phone?.message}>
        <Input placeholder="(00) 00000-0000" {...register("phone")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Tipo de documento" helpText="Opcional" error={errors.documentType?.message}>
          <Select {...register("documentType")}>
            <option value="">Não informar</option>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Número do documento" helpText="Opcional" error={errors.documentNumber?.message}>
          <Input placeholder="Somente números" {...register("documentNumber")} />
        </FormField>
      </div>

      <Button type="submit" isLoading={isSubmitting || updateMutation.isPending} className="self-start">
        Salvar alterações
      </Button>
    </form>
  );
}
