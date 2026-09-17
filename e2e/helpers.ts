import type { Page } from "@playwright/test";

// Login via credenciais de seed (npm run prisma:seed) — nunca via cadastro: signupAction tem rate
// limit de 5 tentativas/hora por IP (Context.md §19, proteção contra criação de contas em massa),
// o que tornaria testes e2e repetidos frágeis.
export async function login(page: Page, email: string, password: string) {
  // Só navega se ainda não estiver em /login — chamar page.goto("/login") incondicionalmente
  // descartaria um ?callbackUrl= já presente (ex.: depois do redirect do middleware.ts a partir de
  // uma rota protegida), fazendo o login voltar para "/" em vez do destino original.
  if (!page.url().includes("/login")) {
    await page.goto("/login");
  }
  await page.getByLabel("E-mail").fill(email);
  // getByRole (não getByLabel) — getByLabel casa pelo texto bruto do <label>, que inclui o "*" de
  // obrigatório (Label.tsx) mesmo ele sendo aria-hidden; getByRole usa o nome acessível de verdade
  // (sem o "*"), e também evita colidir com o aria-label "Mostrar senha" do botão de visibilidade
  // ao lado (PasswordInput.tsx), que "Senha" sem exact também capturaria por substring.
  await page.getByRole("textbox", { name: "Senha", exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

// DateRangePicker.tsx é um calendário próprio num único campo (não dois <input> nativos) — abre
// sempre no mês de hoje, então navega de mês em mês até a data pedida antes de clicar no dia.
export async function selectDateRange(page: Page, label: string, start: Date, end: Date) {
  await page.getByLabel(label).click();
  const dialog = page.getByRole("dialog", { name: "Selecionar período" });

  let viewMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  async function goToDay(target: Date) {
    const targetMonth = new Date(target.getFullYear(), target.getMonth(), 1);
    while (viewMonth.getTime() !== targetMonth.getTime()) {
      const forward = targetMonth.getTime() > viewMonth.getTime();
      await dialog.getByRole("button", { name: forward ? "Próximo mês" : "Mês anterior" }).click();
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + (forward ? 1 : -1), 1);
    }
    await dialog.getByRole("button", { name: String(target.getDate()), exact: true }).click();
  }

  await goToDay(start);
  await goToDay(end);
}
