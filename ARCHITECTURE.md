# Arquitetura — Arvum

## Visão geral

Aplicação full-stack única em Next.js (App Router): o próprio Next cobre frontend e backend via
Route Handlers, evitando manter dois serviços separados para um projeto de 2 pessoas.

```
src/
  app/                     # rotas (App Router) — casca fina, sem regra de negócio
    (auth)/login, (auth)/cadastro
    (app)/propriedades, (app)/perfil, (app)/maquinas, (app)/favoritos
    catalogo/, catalogo/[slug]/          # público, fora do (app)
    api/auth/[...nextauth]/route.ts
    api/v1/properties/route.ts, [id]/route.ts
    api/v1/categories/route.ts
    api/v1/machines/route.ts, [id]/route.ts, [id]/status,
      [id]/images(+[imageId]), [id]/availability(+[blockId])
    api/v1/favorites/route.ts, [machineId]/route.ts
  auth.ts                  # configuração raiz do Auth.js
  middleware.ts            # proteção de rota
  components/
    ui/                    # design system (Button, Input, Textarea, Select, Checkbox, Label, FormField, Card, Alert, Badge, Spinner, EmptyState)
    shared/                # Providers, AppHeader, AppNav, MobileNavDrawer, PublicHeader, Footer, Logo
  features/
    authentication/        # schemas, actions, lib/password.ts, components
    users/
    properties/            # schemas, services, hooks, components
    categories/             # services (leitura), types
    machines/               # schemas, lib (slug, status), services, hooks, components
    favorites/               # services, hooks, components (FavoriteButton, FavoriteMachineCard)
  lib/                     # prisma, env, api-response, session, cn
    geo/                   # distância (Haversine) e geocodificação simulada
  schemas/                 # primitivas zod reutilizáveis
  types/                   # module augmentation (next-auth)

prisma/
  schema.prisma, seed.ts, migrations/
```

Regra de organização: tudo que é **lógica de domínio** (validação, regras, acesso a dados,
componentes de feature) mora em `src/features/<dominio>`. As rotas em `app/` apenas orquestram —
chamam services/actions e renderizam componentes de feature. Módulos futuros (`availability`
completo, `search`, `bookings`, `logistics`, `payments`, `reviews`, `notifications`,
`administration`) seguem o mesmo padrão nas próximas fases.

## Decisões técnicas registradas

| Decisão                              | Escolhido                                                                  | Alternativa descartada    | Motivo                                                                                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                            | Next.js 15 (App Router)                                                    | Next.js 16                | Maior maturidade de integração com Auth.js v5 hoje; usa `middleware.ts` (convenção ainda documentada pelo Auth.js). Revisitar upgrade após Etapa 1 estabilizar.                                                                          |
| ORM                                  | Prisma 6.x                                                                 | Prisma 7.x                | Prisma 7 exige driver adapter obrigatório e `prisma.config.ts` — complexidade extra sem ganho para o MVP.                                                                                                                                |
| Auth                                 | Auth.js (next-auth) v5 beta, Credentials + JWT                             | NextAuth v4               | v5 tem suporte de primeira classe a Route Handlers/Server Actions do App Router.                                                                                                                                                         |
| Hash de senha                        | `bcryptjs`                                                                 | `bcrypt`                  | Sem bindings nativos — evita exigir Visual Studio Build Tools no Windows.                                                                                                                                                                |
| Estilo                               | Tailwind CSS v4 (`@theme` em `globals.css`)                                | `tailwind.config.js`      | Convenção CSS-first atual; tokens centralizados sem arquivo de config adicional.                                                                                                                                                         |
| Sem `PrismaAdapter` do Auth.js       | Sessão JWT + `authorize()` consulta Prisma direto                          | `@auth/prisma-adapter`    | Adapter só é necessário para sessão em banco ou OAuth — não se aplica a Credentials + JWT.                                                                                                                                               |
| Schema Prisma completo já na Etapa 1 | 12 entidades modeladas, só User/Property/Category com features construídas | Modelar entidade por fase | O modelo relacional já está 100% especificado no `Context.md`; adiar geraria `ALTER TABLE` arriscados em FKs cruzadas (Booking→Machine→Property→User). Funcionalidade (rotas/UI) continua estritamente faseada — só o schema vem pronto. |
| `Property` sem soft delete           | Exclusão física bloqueada por regra de dependência (máquina vinculada)     | Adicionar `deletedAt`     | Fiel à lista de campos exata da especificação (`Context.md` §17).                                                                                                                                                                        |
| Sem separação front/back             | Route Handlers do Next cobrem a API                                        | NestJS/Express separado   | Simplicidade para um time de 2 pessoas; API real fica em `/api/v1/*` com mesmo formato de erro que uma API separada teria.                                                                                                               |
| Navegação mobile do header autenticado | Menu hambúrguer (`MobileNavDrawer`)                                      | Barra de abas fixa no rodapé | `AppNav` (4 links) + logo + avatar + "Sair" não cabem em ~375px sem colapsar (overflow horizontal confirmado). Hambúrguer escolhido em vez da barra de abas sugerida no `Context.md` §11.2 por decisão explícita, mantendo a mesma lista de links do desktop (`NAV_ITEMS`, exportado por `AppNav.tsx`) sem duplicar regra de navegação entre versões. |
| Geocodificação e distância            | Adaptador simulado (`mockGeocodingProvider`, tabela estática de capitais/UF + cidades conhecidas) + Haversine puro (`src/lib/geo`) | API de mapas real (Google, Nominatim) | Nenhum provedor de mapas está configurado no MVP (`Context.md` §15). A interface `GeocodingProvider` permite trocar a implementação sem alterar quem consome (`property.service`, `machine.service`) — mesmo padrão de adaptador simulado documentado em `Context.md` §27. |
| Distância calculada em memória, não via SQL geoespacial | `Array.map`/`sort` em JS sobre coordenadas já carregadas pelo Prisma | `ST_Distance`/PostGIS | Volume de dados do MVP (dezenas de máquinas) não justifica extensão geoespacial no banco; app-level é suficiente e mantém a lógica testável isoladamente (`src/lib/geo/distance.test.ts`). Revisitar se o catálogo crescer para milhares de anúncios. |

## Valores monetários e datas

Todos os campos financeiros são `Int` (centavos inteiros) — nunca `Float`. Datas de reserva serão
sempre validadas no servidor (a partir da Fase 4 — Transação); a UI nunca é a única fonte de verdade
para regras de negócio.

## Formato de erro da API

```json
{
  "error": {
    "code": "PROPERTY_HAS_MACHINES",
    "message": "Não é possível remover: existem máquinas vinculadas a esta propriedade.",
    "details": [],
    "requestId": "uuid"
  }
}
```

## Roadmap

1. ✅ **Fundação** — arquitetura, design system, banco, autenticação, propriedades, categorias.
2. ✅ **Oferta** — cadastro de máquinas, imagens (por URL), disponibilidade (bloqueios manuais),
   gerenciamento de anúncios (status), catálogo público mínimo (listagem + detalhe).
3. ✅ **Descoberta** — filtros completos no catálogo (preço, marca, cultura, finalidade,
   necessidade de operador, período), favoritos, e localização/distância estimada (geocodificação
   simulada + Haversine).
4. **Transação** — reservas, cálculo de valores, logística, pagamento simulado, histórico de status.
5. **Confiança** — avaliações, notificações, mensagens, moderação.
6. **Administração e qualidade** — painel admin, indicadores, testes, acessibilidade, segurança, documentação, deploy.

Adaptadores simulados (mapas/geolocalização, pagamento, transportadoras) serão introduzidos nas
fases 2–4 atrás de interfaces de serviço, permitindo substituição futura por provedores reais sem
reescrever regras de negócio.

## Próxima etapa — Fase 4 (Transação)

O schema (`Booking`, `BookingStatusHistory`, `LogisticsQuote`, `Payment`) já existe desde a Etapa 1
(vazio). Nenhuma rota, serviço ou tela desses módulos existe ainda. Quebrando em etapas funcionais
incrementais (`Context.md` §27/§33 — uma etapa completa e testável por vez, começando pela menor):

1. **Solicitação de reserva (mínimo)** — a partir da página de detalhe da máquina, o locatário
   escolhe propriedade de destino e período; o servidor valida (data final > inicial, sem datas
   passadas, duração mín/máx do anúncio, sem sobreposição com `Booking` já confirmado/pendente ou
   `MachineAvailability` manual) e cria o `Booking` (`DRAFT` → `AWAITING_APPROVAL`, ou direto
   `APPROVED` se `instantBooking`), com `BookingStatusHistory` desde a criação. Valores financeiros
   e logística ainda como placeholder — sem cálculo real nesta etapa.
2. **Cálculo logístico** — serviço desacoplado (`Context.md` §8.11, fórmula configurável
   `taxaBase + distanciaKm × valorPorKm × fatorDoEquipamento`), reaproveitando `src/lib/geo`
   (distância já calculada na Fase 3) para gerar `LogisticsQuote` nas 3 modalidades (retirada,
   entrega pelo proprietário, transporte por parceiro simulado).
3. **Composição de preço** — tela de revisão antes de confirmar (`PriceBreakdown`): valor do
   período + logística + taxa de serviço + caução − descontos = total, com retrato dos preços
   congelado na confirmação (alterações futuras no anúncio não afetam reserva já confirmada).
4. **Aprovação do proprietário** — painel mínimo para aceitar/recusar solicitações pendentes
   (`AWAITING_APPROVAL → APPROVED/REJECTED`), com motivo opcional e notificação futura.
5. **Pagamento simulado** — `Payment` associado ao `Booking`, estados `pendente/processando/
   aprovado/recusado`; confirmação avança `AWAITING_PAYMENT → PAYMENT_CONFIRMED`. Sem gateway real,
   sem dado de cartão armazenado.
6. **Acompanhamento de status** — painel do locatário e do proprietário exibindo a reserva atual e
   a linha do tempo (`BookingStatusHistory`); transições seguintes (`TRANSPORT_SCHEDULED →
   IN_TRANSIT → DELIVERED → IN_USE → AWAITING_RETURN → RETURNED → COMPLETED`) restritas por regra
   e responsável, nunca alteração arbitrária de estado.
7. **Cancelamento** — política centralizada em serviço próprio (`Context.md` §9.4), nunca
   percentuais fixos espalhados pelo código; aplica estorno/cobrança conforme o estágio da reserva.

Cada etapa acima deve ser entregue como um fluxo completo e testável (schema já existe → falta
serviço + validação no servidor + rota + tela mínima + testes), sem pular para a etapa seguinte
antes da anterior estar funcional. Avaliações (Fase 5) dependem de `Booking.status = COMPLETED`
existir de fato, então ficam de fora até o fim desta lista.
