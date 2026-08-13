import type { LogisticsMode, Machine } from "@prisma/client";
import { LOGISTICS_DEFAULTS } from "../config";
import { calculateEquipmentFactor } from "./equipment-factor";

type LogisticsMachineInput = Pick<
  Machine,
  | "weight"
  | "width"
  | "height"
  | "length"
  | "requiresOperator"
  | "deliveryRadiusKm"
  | "deliveryPricePerKmInCents"
  | "deliveryBaseFeeInCents"
>;

export interface LogisticsCostInput {
  mode: LogisticsMode;
  distanceKm: number | null;
  machine: LogisticsMachineInput;
}

export interface LogisticsCostResult {
  baseFeeInCents: number;
  pricePerKmInCents: number;
  equipmentFactor: number;
  distanceKm: number;
  totalInCents: number;
  isEstimate: boolean;
}

export type LogisticsCostError = "DELIVERY_OUT_OF_RANGE" | "DESTINATION_DISTANCE_UNKNOWN";

// Cálculo logístico (Context.md §8.11): custoLogistico = taxaBase + (distanciaKm × valorPorKm ×
// fatorDoEquipamento). Serviço desacoplado da interface — nenhum componente calcula esse valor
// diretamente, todos chamam esta função.
export function calculateLogisticsCost(
  input: LogisticsCostInput,
): LogisticsCostResult | LogisticsCostError {
  const { mode, machine } = input;

  // Retirada pelo locatário: ele organiza o próprio transporte, sem custo logístico cobrado pela
  // plataforma (Context.md §8.10).
  if (mode === "RENTER_PICKUP") {
    return {
      baseFeeInCents: 0,
      pricePerKmInCents: 0,
      equipmentFactor: 1,
      distanceKm: input.distanceKm ?? 0,
      totalInCents: 0,
      isEstimate: false,
    };
  }

  // Sem coordenadas resolvidas para origem ou destino não há como calcular custo real — nunca
  // aproxima silenciosamente com zero (Context.md §32: "não apresentar dados simulados como dados
  // reais").
  if (input.distanceKm === null) return "DESTINATION_DISTANCE_UNKNOWN";

  if (mode === "OWNER_DELIVERY" && (machine.deliveryRadiusKm == null || input.distanceKm > machine.deliveryRadiusKm)) {
    return "DELIVERY_OUT_OF_RANGE";
  }

  const defaults =
    mode === "OWNER_DELIVERY" ? LOGISTICS_DEFAULTS.OWNER_DELIVERY : LOGISTICS_DEFAULTS.PARTNER_TRANSPORT;

  // Entrega pelo proprietário usa o preço que ele definiu no anúncio; sem isso, cai no padrão da
  // plataforma (mesmo padrão de "transporte por parceiro").
  const baseFeeInCents =
    mode === "OWNER_DELIVERY" && machine.deliveryBaseFeeInCents != null
      ? machine.deliveryBaseFeeInCents
      : defaults.baseFeeInCents;
  const pricePerKmInCents =
    mode === "OWNER_DELIVERY" && machine.deliveryPricePerKmInCents != null
      ? machine.deliveryPricePerKmInCents
      : defaults.pricePerKmInCents;

  const equipmentFactor = calculateEquipmentFactor(machine);
  const totalInCents = Math.round(baseFeeInCents + input.distanceKm * pricePerKmInCents * equipmentFactor);

  return {
    baseFeeInCents,
    pricePerKmInCents,
    equipmentFactor,
    distanceKm: input.distanceKm,
    totalInCents,
    // A distância vem de Haversine sobre coordenadas geocodificadas de forma simulada (src/lib/geo),
    // nunca uma rota real — todo valor calculado a partir dela é rotulado como estimativa
    // (Context.md §9.6/§32), mesmo padrão já usado na distância exibida no catálogo.
    isEstimate: true,
  };
}
