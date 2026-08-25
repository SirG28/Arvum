import { describe, expect, it } from "vitest";
import { getNextFulfillmentAction, FULFILLMENT_STEPS } from "./fulfillment";

describe("getNextFulfillmentAction", () => {
  it("retirada pelo locatário pula o rastreio de transporte", () => {
    const action = getNextFulfillmentAction("PAYMENT_CONFIRMED", "RENTER_PICKUP");
    expect(action?.action).toBe("CONFIRM_PICKUP");
    expect(action?.actor).toBe("RENTER");
  });

  it("entrega pelo proprietário passa por agendamento e trânsito", () => {
    expect(getNextFulfillmentAction("PAYMENT_CONFIRMED", "OWNER_DELIVERY")?.action).toBe(
      "SCHEDULE_TRANSPORT",
    );
    expect(getNextFulfillmentAction("TRANSPORT_SCHEDULED", "OWNER_DELIVERY")?.action).toBe(
      "START_TRANSIT",
    );
    expect(getNextFulfillmentAction("IN_TRANSIT", "OWNER_DELIVERY")?.action).toBe(
      "CONFIRM_DELIVERY",
    );
  });

  it("transporte por parceiro segue o mesmo fluxo de entrega pelo proprietário", () => {
    expect(getNextFulfillmentAction("PAYMENT_CONFIRMED", "PARTNER_TRANSPORT")?.action).toBe(
      "SCHEDULE_TRANSPORT",
    );
  });

  it("devolução é sinalizada pelo locatário e confirmada pelo proprietário", () => {
    const startReturn = getNextFulfillmentAction("IN_USE", "RENTER_PICKUP");
    expect(startReturn?.action).toBe("START_RETURN");
    expect(startReturn?.actor).toBe("RENTER");

    const confirmReturn = getNextFulfillmentAction("AWAITING_RETURN", "RENTER_PICKUP");
    expect(confirmReturn?.action).toBe("CONFIRM_RETURN");
    expect(confirmReturn?.actor).toBe("OWNER");
  });

  it("retorna null para estados sem próxima ação de acompanhamento (ex.: concluída, aguardando pagamento)", () => {
    expect(getNextFulfillmentAction("COMPLETED", "RENTER_PICKUP")).toBeNull();
    expect(getNextFulfillmentAction("AWAITING_PAYMENT", "RENTER_PICKUP")).toBeNull();
    expect(getNextFulfillmentAction("CANCELLED", "OWNER_DELIVERY")).toBeNull();
  });
});

describe("FULFILLMENT_STEPS", () => {
  it("confirmar entrega ou retirada avança direto para em uso", () => {
    expect(FULFILLMENT_STEPS.CONFIRM_DELIVERY.map((step) => step.nextStatus)).toEqual([
      "DELIVERED",
      "IN_USE",
    ]);
    expect(FULFILLMENT_STEPS.CONFIRM_PICKUP.map((step) => step.nextStatus)).toEqual([
      "DELIVERED",
      "IN_USE",
    ]);
  });

  it("confirmar devolução avança direto para concluída", () => {
    expect(FULFILLMENT_STEPS.CONFIRM_RETURN.map((step) => step.nextStatus)).toEqual([
      "RETURNED",
      "COMPLETED",
    ]);
  });
});
