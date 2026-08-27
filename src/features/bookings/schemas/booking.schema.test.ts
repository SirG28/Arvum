import { describe, expect, it } from "vitest";
import { bookingRequestSchema, bookingDecisionSchema } from "./booking.schema";

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const basePayload = {
  destinationPropertyId: "property-1",
  logisticsMode: "RENTER_PICKUP" as const,
};

describe("bookingRequestSchema", () => {
  it("aceita uma solicitação válida", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
    });
    expect(result.success).toBe(true);
  });

  it("aceita observações opcionais em branco", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem propriedade de destino", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      destinationPropertyId: "",
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita data final anterior ou igual à inicial", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      startDate: daysFromNow(3),
      endDate: daysFromNow(1),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita datas passadas", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      startDate: daysFromNow(-5),
      endDate: daysFromNow(1),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita modalidade logística inválida", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      logisticsMode: "TELEPORT",
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
    });
    expect(result.success).toBe(false);
  });

  it("assume operationSupportIncluded como false quando omitido", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operationSupportIncluded).toBe(false);
    }
  });
});

describe("bookingDecisionSchema", () => {
  it("aceita aprovação sem motivo", () => {
    const result = bookingDecisionSchema.safeParse({ decision: "APPROVED" });
    expect(result.success).toBe(true);
  });

  it("aceita recusa com motivo opcional", () => {
    const result = bookingDecisionSchema.safeParse({
      decision: "REJECTED",
      reason: "Máquina em manutenção nesse período.",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita decisão inválida", () => {
    const result = bookingDecisionSchema.safeParse({ decision: "MAYBE" });
    expect(result.success).toBe(false);
  });

  it("rejeita motivo muito longo", () => {
    const result = bookingDecisionSchema.safeParse({
      decision: "REJECTED",
      reason: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
