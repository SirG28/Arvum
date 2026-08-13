import { describe, expect, it } from "vitest";
import { calculateLogisticsCost } from "./pricing";

const BASE_MACHINE = {
  weight: 200,
  width: 1,
  height: 1,
  length: 1,
  requiresOperator: false,
  deliveryRadiusKm: null as number | null,
  deliveryPricePerKmInCents: null as number | null,
  deliveryBaseFeeInCents: null as number | null,
};

describe("calculateLogisticsCost", () => {
  it("retirada pelo locatário não tem custo, mesmo sem distância", () => {
    const result = calculateLogisticsCost({ mode: "RENTER_PICKUP", distanceKm: null, machine: BASE_MACHINE });
    expect(result).toEqual({
      baseFeeInCents: 0,
      pricePerKmInCents: 0,
      equipmentFactor: 1,
      distanceKm: 0,
      totalInCents: 0,
      isEstimate: false,
    });
  });

  it("retorna erro quando a distância é desconhecida para modos com custo", () => {
    expect(
      calculateLogisticsCost({ mode: "OWNER_DELIVERY", distanceKm: null, machine: BASE_MACHINE }),
    ).toBe("DESTINATION_DISTANCE_UNKNOWN");
    expect(
      calculateLogisticsCost({ mode: "PARTNER_TRANSPORT", distanceKm: null, machine: BASE_MACHINE }),
    ).toBe("DESTINATION_DISTANCE_UNKNOWN");
  });

  it("recusa entrega pelo proprietário sem raio configurado", () => {
    const result = calculateLogisticsCost({ mode: "OWNER_DELIVERY", distanceKm: 10, machine: BASE_MACHINE });
    expect(result).toBe("DELIVERY_OUT_OF_RANGE");
  });

  it("recusa entrega pelo proprietário fora do raio", () => {
    const machine = { ...BASE_MACHINE, deliveryRadiusKm: 20 };
    const result = calculateLogisticsCost({ mode: "OWNER_DELIVERY", distanceKm: 25, machine });
    expect(result).toBe("DELIVERY_OUT_OF_RANGE");
  });

  it("usa o preço do proprietário quando configurado", () => {
    const machine = {
      ...BASE_MACHINE,
      deliveryRadiusKm: 50,
      deliveryBaseFeeInCents: 1000,
      deliveryPricePerKmInCents: 200,
    };
    const result = calculateLogisticsCost({ mode: "OWNER_DELIVERY", distanceKm: 10, machine });
    expect(result).toEqual({
      baseFeeInCents: 1000,
      pricePerKmInCents: 200,
      equipmentFactor: 1,
      distanceKm: 10,
      totalInCents: 1000 + 10 * 200 * 1,
      isEstimate: true,
    });
  });

  it("cai no padrão da plataforma quando o proprietário não definiu preço", () => {
    const machine = { ...BASE_MACHINE, deliveryRadiusKm: 50 };
    const result = calculateLogisticsCost({ mode: "OWNER_DELIVERY", distanceKm: 10, machine });
    expect(result).not.toBe("DELIVERY_OUT_OF_RANGE");
    expect(result).not.toBe("DESTINATION_DISTANCE_UNKNOWN");
    if (typeof result === "string") throw new Error("expected a cost result");
    expect(result.baseFeeInCents).toBe(3000);
    expect(result.pricePerKmInCents).toBe(250);
  });

  it("transporte por parceiro sempre usa a configuração simulada da plataforma", () => {
    const result = calculateLogisticsCost({ mode: "PARTNER_TRANSPORT", distanceKm: 30, machine: BASE_MACHINE });
    if (typeof result === "string") throw new Error("expected a cost result");
    expect(result.baseFeeInCents).toBe(8000);
    expect(result.pricePerKmInCents).toBe(400);
    expect(result.totalInCents).toBe(8000 + 30 * 400 * 1);
    expect(result.isEstimate).toBe(true);
  });

  it("aplica o fator do equipamento ao custo total", () => {
    const heavyMachine = { ...BASE_MACHINE, weight: 6000 };
    const result = calculateLogisticsCost({ mode: "PARTNER_TRANSPORT", distanceKm: 10, machine: heavyMachine });
    if (typeof result === "string") throw new Error("expected a cost result");
    expect(result.equipmentFactor).toBe(1.6);
    expect(result.totalInCents).toBe(Math.round(8000 + 10 * 400 * 1.6));
  });
});
