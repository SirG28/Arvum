import type { Machine } from "@prisma/client";

type EquipmentFactorInput = Pick<Machine, "weight" | "width" | "height" | "length" | "requiresOperator">;

const WEIGHT_TIER_FACTOR: { maxKg: number; factor: number }[] = [
  { maxKg: 500, factor: 1 },
  { maxKg: 2000, factor: 1.15 },
  { maxKg: 5000, factor: 1.35 },
  { maxKg: Infinity, factor: 1.6 },
];

const LARGE_DIMENSION_METERS = 3;
const LARGE_DIMENSION_SURCHARGE = 0.1;
const OPERATOR_SURCHARGE = 0.15;

// Fator do equipamento (Context.md §8.11): baseado em peso, dimensões e necessidade de operador —
// nunca na categoria, que é um texto administrável pelo painel (Context.md §8.3) e não deve virar
// regra hardcoded no código.
export function calculateEquipmentFactor(machine: EquipmentFactorInput): number {
  const weightTier = WEIGHT_TIER_FACTOR.find((tier) => (machine.weight ?? 0) <= tier.maxKg)!;
  let factor = weightTier.factor;

  const maxDimension = Math.max(machine.width ?? 0, machine.height ?? 0, machine.length ?? 0);
  if (maxDimension > LARGE_DIMENSION_METERS) factor += LARGE_DIMENSION_SURCHARGE;

  if (machine.requiresOperator) factor += OPERATOR_SURCHARGE;

  return Math.round(factor * 100) / 100;
}
