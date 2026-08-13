import { describe, expect, it } from "vitest";
import { calculateEquipmentFactor } from "./equipment-factor";

describe("calculateEquipmentFactor", () => {
  it("retorna o fator base para máquina leve, sem operador", () => {
    const factor = calculateEquipmentFactor({
      weight: 200,
      width: 1,
      height: 1,
      length: 1,
      requiresOperator: false,
    });
    expect(factor).toBe(1);
  });

  it("trata peso ausente como o menor patamar", () => {
    const factor = calculateEquipmentFactor({
      weight: null,
      width: null,
      height: null,
      length: null,
      requiresOperator: false,
    });
    expect(factor).toBe(1);
  });

  it("aumenta o fator conforme o peso sobe de patamar", () => {
    const light = calculateEquipmentFactor({
      weight: 400,
      width: null,
      height: null,
      length: null,
      requiresOperator: false,
    });
    const medium = calculateEquipmentFactor({
      weight: 1500,
      width: null,
      height: null,
      length: null,
      requiresOperator: false,
    });
    const heavy = calculateEquipmentFactor({
      weight: 6000,
      width: null,
      height: null,
      length: null,
      requiresOperator: false,
    });
    expect(light).toBeLessThan(medium);
    expect(medium).toBeLessThan(heavy);
  });

  it("adiciona sobretaxa para dimensão grande (> 3m)", () => {
    const withoutLarge = calculateEquipmentFactor({
      weight: 200,
      width: 1,
      height: 1,
      length: 1,
      requiresOperator: false,
    });
    const withLarge = calculateEquipmentFactor({
      weight: 200,
      width: 1,
      height: 1,
      length: 3.5,
      requiresOperator: false,
    });
    expect(withLarge).toBeCloseTo(withoutLarge + 0.1);
  });

  it("adiciona sobretaxa quando exige operador", () => {
    const withoutOperator = calculateEquipmentFactor({
      weight: 200,
      width: 1,
      height: 1,
      length: 1,
      requiresOperator: false,
    });
    const withOperator = calculateEquipmentFactor({
      weight: 200,
      width: 1,
      height: 1,
      length: 1,
      requiresOperator: true,
    });
    expect(withOperator).toBeCloseTo(withoutOperator + 0.15);
  });
});
