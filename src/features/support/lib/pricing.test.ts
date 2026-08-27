import { describe, expect, it } from "vitest";
import { calculateOperationSupportCost } from "./pricing";
import { OPERATION_SUPPORT_PRICE_IN_CENTS } from "../config";

describe("calculateOperationSupportCost", () => {
  it("retorna o preço configurado quando contratado", () => {
    expect(calculateOperationSupportCost(true)).toBe(OPERATION_SUPPORT_PRICE_IN_CENTS);
  });

  it("retorna zero quando não contratado", () => {
    expect(calculateOperationSupportCost(false)).toBe(0);
  });
});
