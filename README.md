# Arvum

**Arvum** (do latim *arvum*, "campo cultivado") é uma plataforma AgTech que conecta produtores
rurais, máquinas agrícolas ociosas e logística — transformando equipamento parado em produtividade.

Projeto acadêmico da FIAP (Web Design — Startup One). Marketplace que conecta produtores rurais que
precisam alugar máquinas agrícolas a proprietários com equipamentos ociosos, com logística
integrada, cálculo transparente de preço, reservas com calendário de disponibilidade, pagamento
simulado e avaliações bilaterais.

Integrantes:

- Ana Carolina Cantarelli Fernandes — RM 561491
- Sarah Gonçalves Garcia — RM 563539

A especificação completa do produto está em [`Context.md`](./Context.md).

## Status atual — Fase 3 (Descoberta) concluída

Roadmap completo em [`ARCHITECTURE.md`](./ARCHITECTURE.md#roadmap). Implementado:

- Scaffold Next.js (App Router) + TypeScript + Tailwind CSS v4.
- Banco de dados: schema Prisma completo (12 entidades do domínio) + seed de demonstração.
- Autenticação: cadastro, login, logout, sessão JWT, proteção de rotas.
- Design system: componentes de UI reutilizáveis (Button, Input, Textarea, Select, Checkbox, Card,
  Alert, Badge, FormField, Spinner, EmptyState).
- CRUD completo de propriedades (criar, listar, editar, remover) com validação no servidor.
- Cadastro e gestão de máquinas: dados do anúncio, imagens (por URL), disponibilidade (bloqueios
  manuais) e status do anúncio (rascunho, publicado, pausado, arquivado).
- Catálogo público (`/catalogo`) com busca por nome, filtro por categoria, faixa de preço, marca,
  cultura recomendada, finalidade, necessidade de operador e período desejado (exclui máquinas com
  bloqueio manual sobreposto), e página de detalhe de cada máquina.
- Favoritos: salvar/remover máquinas (coração no catálogo e no detalhe) e consultar em
  `/favoritos`, restrito a usuários autenticados.
- Localização e distância estimada: propriedades ganham coordenadas automaticamente (adaptador de
  geocodificação simulado, sem API externa), e o catálogo aceita "onde você vai usar" (cidade/UF)
  para exibir, ordenar e filtrar por raio máximo a distância estimada até cada máquina — persistida
  também na página de detalhe.

Ainda não implementado (fases seguintes): reservas, logística, pagamento, avaliações,
notificações, painel administrativo — ver roadmap e as decisões de escopo em
[`BUSINESS_RULES.md`](./BUSINESS_RULES.md).

## Stack

| Camada                | Tecnologia                                                   |
| --------------------- | ------------------------------------------------------------ |
| Framework             | Next.js 15 (App Router), React 19, TypeScript                |
| Estilo                | Tailwind CSS v4 (tokens em `src/app/globals.css`)            |
| Banco de dados        | PostgreSQL 16 + Prisma ORM                                   |
| Autenticação          | Auth.js (next-auth) v5, Credentials + sessão JWT, bcryptjs   |
| Formulários/validação | React Hook Form + Zod                                        |
| Estado assíncrono     | TanStack Query                                               |
| Testes                | Vitest + Testing Library (unit/integração), Playwright (e2e) |

Decisões técnicas registradas em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Pré-requisitos

- Node.js 20+
- Docker Desktop (opcional, para subir o Postgres local) ou uma instância Postgres já disponível

## Como executar

```bash
npm install
```

Copie `.env.example` para `.env` e gere um `AUTH_SECRET`:

```bash
cp .env.example .env
npx auth secret
```

Suba o banco de dados local (opcional, se não tiver Postgres já rodando):

```bash
docker compose up -d
```

Rode as migrations e o seed:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Credenciais de demonstração (apenas ambiente de desenvolvimento)

Senha para todas as contas de seed: `Demo@123`

| Papel          | E-mail                        |
| -------------- | ----------------------------- |
| Administradora | admin@arvum.dev          |
| Proprietário   | joao.owner@arvum.dev     |
| Proprietário   | marta.owner@arvum.dev    |
| Proprietário   | carlos.owner@arvum.dev   |
| Proprietário   | fernanda.owner@arvum.dev |
| Locatário      | bruno.renter@arvum.dev   |
| Locatário      | camila.renter@arvum.dev  |
| Locatário      | diego.renter@arvum.dev   |
| Locatário      | elaine.renter@arvum.dev  |

## Scripts disponíveis

| Comando                  | Descrição                                 |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento               |
| `npm run build`          | Build de produção                         |
| `npm run start`          | Servidor de produção (após build)         |
| `npm run lint`           | ESLint                                    |
| `npm run typecheck`      | Verificação de tipos (`tsc --noEmit`)     |
| `npm run test`           | Testes unitários/integração (Vitest)      |
| `npm run test:e2e`       | Testes end-to-end (Playwright)            |
| `npm run prisma:migrate` | Cria/aplica migrations em desenvolvimento |
| `npm run prisma:seed`    | Popula o banco com dados de demonstração  |
| `npm run db:studio`      | Abre o Prisma Studio                      |
| `npm run db:reset`       | Reseta o banco (migrations + seed)        |

## Variáveis de ambiente

Ver [`.env.example`](./.env.example). Nenhum segredo real deve ser commitado — `.env` está no
`.gitignore`.

## Documentação relacionada

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitetura, decisões técnicas e roadmap
- [`BUSINESS_RULES.md`](./BUSINESS_RULES.md) — regras de negócio implementadas e planejadas
- [`Context.md`](./Context.md) — especificação completa do produto
