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
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

const DOCUMENT_TYPE_LABELS: Record<string, string> = { CPF: "CPF", CNPJ: "CNPJ" };

interface ProfileFormProps {
  user: Pick<
    User,
    "name" | "email" | "phone" | "documentType" | "documentNumber" | "avatarUrl" | "bio"
  >;
  // Navega de volta ao voltar/salvar — precisa ser uma string (não uma função) porque este é um
  // client component recebido a partir de um Server Component (page.tsx), que não pode passar
  // callbacks como prop.
  closeHref?: string;
}

export function ProfileForm({ user, closeHref }: ProfileFormProps) {
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
      bio: user.bio ?? "",
    },
  });

  const name = watch("name");
  const avatarUrl = watch("avatarUrl");
  const bio = watch("bio");

  async function onSubmit(data: ProfileInput) {
    setSubmitError(null);
    try {
      await updateMutation.mutateAsync(data);
      // A sessão JWT não é revalidada contra o banco a cada requisição — sem isto, o nome no
      // cabeçalho ficaria desatualizado até um novo login (ver comentário em src/auth.ts).
      await update({ name: data.name });
      if (closeHref) {
        router.push(closeHref);
      } else {
        router.refresh();
      }
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

      <FormField
        label="Sobre você"
        helpText={`Opcional · aparece no seu perfil · ${(bio ?? "").length}/280`}
        error={errors.bio?.message}
      >
        <Textarea
          placeholder="Conte um pouco sobre você para quem for alugar ou anunciar com você."
          maxLength={280}
          rows={3}
          {...register("bio")}
        />
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

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isSubmitting || updateMutation.isPending}>
          Salvar alterações
        </Button>
        {closeHref && (
          <button
            type="button"
            onClick={() => router.push(closeHref)}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:underline"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
