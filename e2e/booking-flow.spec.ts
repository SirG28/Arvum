import { test, expect } from "@playwright/test";
import { login, selectDateRange } from "./helpers";

// Fluxo principal da plataforma (Context.md §10.3): solicitar aluguel, pagar (simulado), acompanhar
// o status e cancelar. Datas calculadas a partir de hoje (nunca fixas — o DateRangePicker não deixa
// selecionar o passado) numa máquina do seed sem aluguéis futuros cadastrados; cancela ao final
// para não deixar o período ocupado numa reexecução do teste.
test("locatário solicita aluguel, vê a comissão da Arvum, paga e cancela", async ({ page }) => {
  await login(page, "bruno.renter@arvum.dev", "Demo@123");

  await page.goto("/catalogo/rocadeira-hidraulica-lavrale-8");

  const start = new Date();
  start.setDate(start.getDate() + 2);
  const end = new Date();
  end.setDate(end.getDate() + 4);

  await selectDateRange(page, "Período da locação", start, end);
  await page.getByLabel("Como retirar/receber").selectOption({ label: "Eu mesmo retiro a máquina" });

  // Prévia de valores (Context.md §33) — a taxa de serviço precisa vir preenchida com a comissão
  // real da Arvum (Fase 7), não mais o valor zerado provisório de antes dela ser calculada.
  await expect(page.getByText("Valores estimados")).toBeVisible();
  const serviceFeeRow = page.getByText("Taxa de serviço", { exact: true }).locator("..");
  await expect(serviceFeeRow).not.toContainText("R$ 0,00");

  await page.getByRole("button", { name: "Solicitar aluguel" }).click();

  await page.waitForURL(/\/alugueis\/[^/]+$/);
  await expect(page.getByText("Aguardando pagamento").first()).toBeVisible();

  await page.getByRole("button", { name: /Confirmar pagamento/ }).click();
  await expect(page.getByText("Pagamento confirmado").first()).toBeVisible();

  await page.getByRole("button", { name: "Cancelar aluguel" }).click();
  await page.getByRole("button", { name: "Sim, cancelar aluguel" }).click();
  await expect(page.getByText("Cancelado").first()).toBeVisible();
});
