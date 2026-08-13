import { describe, expect, it } from "vitest";
import { isBookingCancellableByRenter } from "./cancellation";

describe("isBookingCancellableByRenter", () => {
  it("permite cancelar antes do pagamento", () => {
    expect(isBookingCancellableByRenter("DRAFT")).toBe(true);
    expect(isBookingCancellableByRenter("AWAITING_APPROVAL")).toBe(true);
    expect(isBookingCancellableByRenter("APPROVED")).toBe(true);
    expect(isBookingCancellableByRenter("AWAITING_PAYMENT")).toBe(true);
  });

  it("não permite cancelar após o pagamento ou em estados finais", () => {
    expect(isBookingCancellableByRenter("PAYMENT_CONFIRMED")).toBe(false);
    expect(isBookingCancellableByRenter("IN_USE")).toBe(false);
    expect(isBookingCancellableByRenter("COMPLETED")).toBe(false);
    expect(isBookingCancellableByRenter("CANCELLED")).toBe(false);
    expect(isBookingCancellableByRenter("REJECTED")).toBe(false);
  });
});
