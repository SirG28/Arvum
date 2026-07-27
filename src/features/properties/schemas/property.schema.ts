import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().trim().min(3, "Informe um nome para a propriedade."),
  addressLine: z.string().trim().min(3, "Informe o endereço."),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  district: z.string().trim().optional(),
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.string().trim().length(2, "Use a sigla do estado (UF), ex.: SP.").toUpperCase(),
  postalCode: z.string().trim().min(8, "Informe um CEP válido."),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  accessNotes: z.string().trim().optional(),
  roadType: z.string().trim().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
