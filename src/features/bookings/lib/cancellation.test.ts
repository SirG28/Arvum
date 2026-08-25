import { describe, expect, it } from "vitest";
import {
  isBookingCancellableByRenter,
  isBookingCancellableByOwner,
  resolveCancellationRefund,
} from "./cancellation";

describe("isBookingCancellableByRenter", () => {
  it("permite cancelar antes do pagamento", () => {
    expect(isBookingCancellableByRenter("DRAFT")).toBe(true);
    expect(isBookingCancellableByRenter("AWAITING_APPROVAL")).toBe(true);
    expect(isBookingCancellableByRenter("APPROVED")).toBe(true);
    expect(isBookingCancellableByRenter("AWAITING_PAYMENT")).toBe(true);
  });

  it("permite cancelar logo após o pagamento confirmado", () => {
    expect(isBookingCancellableByRenter("PAYMENT_CONFIRMED")).toBe(true);
  });

  it("não permite cancelar depois que o transporte foi organizado ou em estados finais", () => {
    expect(isBookingCancellableByRenter("TRANSPORT_SCHEDULED")).toBe(false);
    expect(isBookingCancellableByRenter("IN_USE")).toBe(false);
    expect(isBookingCancellableByRenter("COMPLETED")).toBe(false);
    expect(isBookingCancellableByRenter("CANCELLED")).toBe(false);
    expect(isBookingCancellableByRenter("REJECTED")).toBe(false);
  });
});

describe("isBookingCancellableByOwner", () => {
  it("permite cancelar depois de aprovada e até o pagamento confirmado", () => {
    expect(isBookingCancellableByOwner("APPROVED")).toBe(true);
    expect(isBookingCancellableByOwner("AWAITING_PAYMENT")).toBe(true);
    expect(isBookingCancellableByOwner("PAYMENT_CONFIRMED")).toBe(true);
  });

  it("não permite cancelar antes da aprovação (usa recusar) nem após o transporte organizado", () => {
    expect(isBookingCancellableByOwner("AWAITING_APPROVAL")).toBe(false);
    expect(isBookingCancellableByOwner("TRANSPORT_SCHEDULED")).toBe(false);
    expect(isBookingCancellableByOwner("COMPLETED")).toBe(false);
  });
});

describe("resolveCancellationRefund", () => {
  const start = new Date("2026-09-10T00:00:00Z");

  it("é NOT_APPLICABLE antes do pagamento confirmado, pois nada foi cobrado", () => {
    expect(resolveCancellationRefund("APPROVED", start, "RENTER")).toBe("NOT_APPLICABLE");
    expect(resolveCancellationRefund("AWAITING_PAYMENT", start, "OWNER")).toBe("NOT_APPLICABLE");
  });

  it("cancelamento pelo proprietário sempre é estorno integral quando já houve pagamento", () => {
    const now = new Date("2026-09-09T00:00:00Z");
    expect(resolveCancellationRefund("PAYMENT_CONFIRMED", start, "OWNER", now)).toBe("FULL");
  });

  it("cancelamento pelo locatário com antecedência suficiente é integral", () => {
    const now = new Date("2026-09-05T00:00:00Z");
    expect(resolveCancellationRefund("PAYMENT_CONFIRMED", start, "RENTER", now)).toBe("FULL");
  });

  it("cancelamento pelo locatário sem antecedência suficiente não gera estorno", () => {
    const now = new Date("2026-09-09T00:00:00Z");
    expect(resolveCancellationRefund("PAYMENT_CONFIRMED", start, "RENTER", now)).toBe("NONE");
  });
});
