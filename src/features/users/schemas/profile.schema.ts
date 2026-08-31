import { z } from "zod";
import { DocumentType } from "@prisma/client";

function emptyToUndefined(value: unknown) {
  return value === "" || value === null ? undefined : value;
}

export const profileSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo."),
    phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    documentType: z.preprocess(emptyToUndefined, z.nativeEnum(DocumentType).optional()),
    // Só dígitos — mesmo padrão leve de validação usado no CEP de propriedades (sem dígito
    // verificador de CPF/CNPJ, só o tamanho esperado para cada tipo).
    documentNumber: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .transform((value) => value.replace(/\D/g, ""))
        .optional(),
    ),
    // Aceita tanto uma URL http(s) normal quanto uma data URL (foto lida do dispositivo pelo
    // AvatarUpload.tsx) — url() do zod já aceita o esquema "data:" (é uma URL válida pelo
    // construtor URL do navegador). O limite de tamanho é a validação real aqui: guarda contra um
    // payload absurdo chegar ao servidor mesmo que a checagem de 1,5 MB no cliente seja
    // contornada.
    avatarUrl: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(2_500_000, "A imagem é grande demais.")
        .url("Informe uma URL válida.")
        .optional(),
    ),
    bio: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(280, "Máximo de 280 caracteres.").optional(),
    ),
  })
  .refine((data) => !data.documentNumber || data.documentType, {
    message: "Selecione o tipo de documento (CPF ou CNPJ).",
    path: ["documentType"],
  })
  .refine((data) => !data.documentType || data.documentNumber, {
    message: "Informe o número do documento.",
    path: ["documentNumber"],
  })
  .refine(
    (data) =>
      !data.documentNumber ||
      (data.documentType === "CPF" && data.documentNumber.length === 11) ||
      (data.documentType === "CNPJ" && data.documentNumber.length === 14),
    { message: "Número de documento inválido para o tipo selecionado.", path: ["documentNumber"] },
  );

export type ProfileInput = z.infer<typeof profileSchema>;
