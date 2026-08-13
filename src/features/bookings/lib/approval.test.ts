import { describe, expect, it } from "vitest";
import { isBookingPendingApproval } from "./approval";

describe("isBookingPendingApproval", () => {
  it("permite decisão apenas aguardando aprovação", () => {
    expect(isBookingPendingApproval("AWAITING_APPROVAL")).toBe(true);
  });

  it("não permite decisão em outros estados", () => {
    expect(isBookingPendingApproval("DRAFT")).toBe(false);
    expect(isBookingPendingApproval("APPROVED")).toBe(false);
    expect(isBookingPendingApproval("REJECTED")).toBe(false);
    expect(isBookingPendingApproval("CANCELLED")).toBe(false);
    expect(isBookingPendingApproval("COMPLETED")).toBe(false);
  });
});
