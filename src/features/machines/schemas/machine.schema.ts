import { z } from "zod";
import { MachineCondition } from "@prisma/client";

function toCents(value: number) {
  return Math.round(value * 100);
}

function emptyToUndefined(value: unknown) {
  return value === "" || value === null ? undefined : value;
}

const optionalPositiveNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().positive("Informe um valor maior que zero.").optional(),
);

const priceInReais = z.coerce.number().positive("Informe um valor maior que zero.");
const optionalPriceInReais = z.preprocess(
  emptyToUndefined,
  z.coerce.number().positive("Informe um valor maior que zero.").optional(),
);

export const machineSchema = z
  .object({
    propertyId: z.string().trim().min(1, "Selecione a propriedade onde a máquina fica."),
    categoryId: z.string().trim().min(1, "Selecione uma categoria."),
    title: z.string().trim().min(3, "Informe um nome para o anúncio."),
    brand: z.string().trim().optional(),
    model: z.string().trim().optional(),
    manufactureYear: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .min(1950, "Informe um ano válido.")
        .max(new Date().getFullYear() + 1, "Informe um ano válido.")
        .optional(),
    ),
    description: z.string().trim().min(20, "Descreva a máquina com pelo menos 20 caracteres."),
    purpose: z.string().trim().optional(),
    // Campo de formulário bruto ("soja, milho"). Quando a API revalida um payload que já veio
    // transformado em array (reenvio do client), a rota normaliza de volta para string antes do
    // parse — ver src/app/api/v1/machines/route.ts.
    recommendedCrops: z
      .string()
      .trim()
      .optional()
      .transform((value) =>
        value
          ? value
              .split(",")
              .map((crop) => crop.trim())
              .filter(Boolean)
          : [],
      ),
    condition: z.nativeEnum(MachineCondition, {
      required_error: "Selecione a condição do equipamento.",
      invalid_type_error: "Selecione a condição do equipamento.",
    }),
    weight: optionalPositiveNumber,
    width: optionalPositiveNumber,
    height: optionalPositiveNumber,
    length: optionalPositiveNumber,
    requiresOperator: z.boolean().optional().default(false),
    dailyPrice: priceInReais,
    hourlyPrice: optionalPriceInReais,
    minimumPrice: optionalPriceInReais,
    deposit: optionalPriceInReais,
    minimumRentalDays: z.coerce.number().int().min(1, "Informe ao menos 1 dia.").default(1),
    maximumRentalDays: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).optional(),
    ),
    deliveryRadiusKm: optionalPositiveNumber,
    // Preço de entrega (Context.md §8.10: "o proprietário define... preço por quilômetro; taxa
    // mínima"). Sem raio de entrega definido, a plataforma nunca oferece "entrega pelo
    // proprietário" como modalidade — ver refine abaixo.
    deliveryPricePerKm: optionalPriceInReais,
    deliveryBaseFee: optionalPriceInReais,
  })
  .refine((data) => !data.maximumRentalDays || data.maximumRentalDays >= data.minimumRentalDays, {
    message: "A duração máxima deve ser maior ou igual à mínima.",
    path: ["maximumRentalDays"],
  })
  .refine((data) => data.deliveryRadiusKm || (!data.deliveryPricePerKm && !data.deliveryBaseFee), {
    message: "Defina o raio de atendimento para configurar o preço de entrega.",
    path: ["deliveryRadiusKm"],
  });

// O client envia recommendedCrops já transformado em array (saída do resolver do
// react-hook-form). Como o schema espera a string bruta do formulário ("soja, milho"), a rota da
// API normaliza de volta antes do safeParse, tornando a revalidação no servidor idempotente.
export function normalizeMachinePayload(body: unknown) {
  if (body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).recommendedCrops)) {
    return {
      ...body,
      recommendedCrops: (body as { recommendedCrops: string[] }).recommendedCrops.join(", "),
    };
  }
  return body;
}

// Tipo usado pelo formulário (react-hook-form/register): shape "bruto", antes do transform.
export type MachineFormInput = z.input<typeof machineSchema>;
// Tipo produzido pelo resolver após validar/transformar: o que é enviado à API e persistido.
export type MachineFormOutput = z.output<typeof machineSchema>;

export function toMachinePersistedData(input: MachineFormOutput) {
  return {
    propertyId: input.propertyId,
    categoryId: input.categoryId,
    title: input.title,
    brand: input.brand || undefined,
    model: input.model || undefined,
    manufactureYear: input.manufactureYear,
    description: input.description,
    purpose: input.purpose || undefined,
    recommendedCrops: input.recommendedCrops,
    condition: input.condition,
    weight: input.weight,
    width: input.width,
    height: input.height,
    length: input.length,
    requiresOperator: input.requiresOperator,
    dailyPriceInCents: toCents(input.dailyPrice),
    hourlyPriceInCents: input.hourlyPrice ? toCents(input.hourlyPrice) : undefined,
    minimumPriceInCents: input.minimumPrice ? toCents(input.minimumPrice) : undefined,
    depositInCents: input.deposit ? toCents(input.deposit) : undefined,
    minimumRentalDays: input.minimumRentalDays,
    maximumRentalDays: input.maximumRentalDays,
    deliveryRadiusKm: input.deliveryRadiusKm,
    deliveryPricePerKmInCents: input.deliveryPricePerKm ? toCents(input.deliveryPricePerKm) : undefined,
    deliveryBaseFeeInCents: input.deliveryBaseFee ? toCents(input.deliveryBaseFee) : undefined,
  };
}
