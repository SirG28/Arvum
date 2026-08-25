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

## Status atual — Fase 5 (Confiança) em andamento — avaliações concluídas

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
- Solicitação de reserva (mínima): a partir da página de detalhe, o locatário escolhe propriedade
  de destino, período e modalidade logística; o servidor valida disponibilidade (sem sobrepor
  bloqueios manuais ou outras reservas ativas), duração mín/máx do anúncio e calcula o valor da
  locação, criando a reserva já aprovada (anúncios com reserva instantânea) ou aguardando aprovação
  do proprietário. O catálogo também deixou de listar máquinas com reserva ativa no período
  buscado.
- Cálculo logístico: custo real calculado para as 3 modalidades (retirada pelo locatário, entrega
  pelo proprietário, transporte por parceiro simulado), usando a distância entre a propriedade da
  máquina e a de destino. O proprietário pode configurar preço de entrega por km e taxa mínima no
  anúncio; sem configuração própria, ou para transporte por parceiro, vale o padrão da plataforma.
  Entrega fora do raio de atendimento é recusada. Todo valor é rotulado como estimativa.
- Prévia de valores antes de solicitar: assim que destino, período e modalidade estão
  preenchidos, o formulário de reserva mostra locação + logística + total (ou o motivo de não
  poder calcular, ex.: fora do raio de entrega) antes do botão "Solicitar reserva".
- Feedback de sucesso reforçado com notificação (toast), além da confirmação já exibida na tela.
- Aprovação/recusa da solicitação pelo proprietário (`/reservas/recebidas`), com motivo opcional
  registrado no andamento da reserva.
- Pagamento simulado: o locatário confirma o pagamento (cartão ou Pix, ambos simulados) assim que
  a reserva é aprovada; nenhum dado de cartão é coletado.
- Acompanhamento de status até a conclusão: depois do pagamento confirmado, cada lado da reserva
  vê um botão de "próxima etapa" (agendar transporte, iniciar transporte, confirmar entrega/
  retirada, sinalizar devolução, confirmar devolução), sempre restrito a quem é responsável por
  aquela ação no anúncio (proprietário ou locatário) — nunca uma alteração livre de status.
  Retirada pelo locatário pula o rastreio de transporte; entrega pelo proprietário e transporte
  por parceiro passam por agendamento e trânsito antes da entrega.
- Cancelamento pelo locatário ou pelo proprietário, com política de estorno centralizada: sem
  cobrança antes do pagamento, estorno integral se o proprietário cancelar, e estorno integral ou
  não (conforme antecedência até o início do período) se o locatário cancelar depois do pagamento
  confirmado — sempre explicado antes de confirmar o cancelamento.
- Avaliações: depois que uma reserva é concluída, locatário e proprietário avaliam um ao outro uma
  única vez por reserva (nota geral de 1 a 5 + aspectos opcionais — estado do equipamento,
  comunicação, pontualidade e experiência logística para o locatário; comunicação e pontualidade
  para o proprietário — e comentário opcional). A página de cada máquina mostra a nota média e as
  avaliações recebidas do locatário (nunca a avaliação que o proprietário fez do locatário); o
  catálogo mostra a nota média em cada resultado.

Ainda não implementado (fases seguintes): taxa de serviço (comissão), notificações, mensagens,
painel administrativo, monetização avançada (assinatura Premium, anúncios patrocinados) — ver
roadmap e as decisões de escopo em [`BUSINESS_RULES.md`](./BUSINESS_RULES.md).

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
