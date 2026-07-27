import { describe, expect, it } from "vitest";
import { machineAvailabilitySchema } from "./machine-availability.schema";

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

describe("machineAvailabilitySchema", () => {
  it("aceita um bloqueio válido no futuro", () => {
    const result = machineAvailabilitySchema.safeParse({
      startDate: daysFromNow(1),
      endDate: daysFromNow(3),
    });
    expect(result.success).toBe(true);
  });

  it("rejeita data final anterior ou igual à inicial", () => {
    const result = machineAvailabilitySchema.safeParse({
      startDate: daysFromNow(3),
      endDate: daysFromNow(1),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita datas passadas", () => {
    const result = machineAvailabilitySchema.safeParse({
      startDate: daysFromNow(-5),
      endDate: daysFromNow(1),
    });
    expect(result.success).toBe(false);
  });
});
