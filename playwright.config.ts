import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Servidor de dev (não build de produção): a primeira requisição de cada rota ainda não visitada
  // compila sob demanda, o que pode passar bem do timeout padrão de 30s por ação — daí o timeout
  // maior aqui. workers: 1 evita duas rotas diferentes compilando ao mesmo tempo (mesmo processo
  // Next), a causa mais comum de estourar esse timeout mesmo com ele alto.
  timeout: 60_000,
  workers: 1,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: { baseURL: "http://localhost:3000" },
});
