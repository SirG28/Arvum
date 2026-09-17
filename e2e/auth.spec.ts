import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// middleware.ts (Context.md §19): rota autenticada redireciona quem não está logado para /login
// preservando o destino em callbackUrl, e volta pra lá depois de entrar — nunca solta o usuário na
// home, perdendo o que ele queria fazer.
test("rota protegida redireciona para login e volta ao destino após entrar", async ({ page }) => {
  await page.goto("/favoritos");
  await page.waitForURL(/\/login\?callbackUrl=%2Ffavoritos/);

  await login(page, "bruno.renter@arvum.dev", "Demo@123");

  await expect(page).toHaveURL(/\/favoritos$/);
});
