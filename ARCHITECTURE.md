# Arquitetura — Arvum

## Visão geral

Aplicação full-stack única em Next.js (App Router): o próprio Next cobre frontend e backend via
Route Handlers, evitando manter dois serviços separados para um projeto de 2 pessoas.

```
src/
  app/                     # rotas (App Router) — casca fina, sem regra de negócio
    (auth)/login, (auth)/cadastro
    (app)/propriedades, (app)/perfil, (app)/maquinas, (app)/favoritos,
      (app)/alugueis, (app)/configuracoes
    catalogo/, catalogo/[slug]/          # público, fora do (app)
    api/auth/[...nextauth]/route.ts
    api/v1/properties/route.ts, [id]/route.ts
    api/v1/categories/route.ts
    api/v1/machines/route.ts, [id]/route.ts, [id]/status,
      [id]/images(+[imageId]), [id]/availability(+[blockId]), [id]/bookings, [id]/booking-quote
    api/v1/favorites/route.ts, [machineId]/route.ts
    api/v1/bookings/open-count/route.ts, [id]/route.ts, [id]/status/route.ts,
      [id]/payment/route.ts, [id]/fulfillment/route.ts
  auth.ts                  # configuração raiz do Auth.js
  middleware.ts            # proteção de rota
  components/
    ui/                    # design system (Button, Input, Textarea, Select, Checkbox, Label, FormField, Card, Alert, Badge, Spinner, EmptyState, Toast, Modal, ConfirmationDialog)
    shared/                # Providers, ToastProvider, AppHeader, AppNav, MobileNavDrawer, PublicHeader, Footer, Logo
  features/
    authentication/        # schemas, actions, lib/password.ts, components
    users/
    properties/            # schemas, services, hooks, components
    categories/             # services (leitura), types
    machines/               # schemas, lib (slug, status), services, hooks, components
    favorites/               # services, hooks, components (FavoriteButton, FavoriteMachineCard)
    bookings/                 # schemas, lib (pricing, cancellation, fulfillment, hold, status-labels),
                               #   services, hooks, components (BookingRequestForm,
                               #   CancelBookingButton, FulfillmentActionButton)
    logistics/                # config (preços padrão), lib (cálculo logístico, fator do equipamento)
    payments/                 # schemas, lib (labels), services, hooks, components (PaymentForm)
    reviews/                  # schemas, lib (nota média), services, hooks, components
                               #   (ReviewForm, ReviewsSection)
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
| Monetização                          | Modelo híbrido — comissão (8%–12%) + assinatura Premium + anúncios patrocinados | Apenas comissão, ou apenas assinatura fixa | Comissão garante receita desde a primeira transação (sem exigir mensalidade obrigatória do locatário); assinatura Premium e anúncios passam a representar parcela crescente do faturamento à medida que a base de usuários aumenta, sem depender de uma única fonte (`Context.md` §8.21). |
| Preço de entrega por máquina, mas transporte por parceiro é config. global | `Machine.deliveryPricePerKmInCents`/`deliveryBaseFeeInCents` (opcionais, definidos pelo proprietário); `PARTNER_TRANSPORT` usa `src/features/logistics/config.ts` | Preço de entrega também global | `Context.md` §8.10 diz explicitamente que o proprietário define preço por km e taxa mínima de entrega — fiel à especificação. Já "transporte por parceiro" não tem parceiro real integrado, então não há quem definir um preço por máquina; fica em configuração de plataforma, substituível depois por uma tabela de transportadoras (`Context.md` §8.11). |
| Fator do equipamento não usa a categoria | `calculateEquipmentFactor` (`src/features/logistics/lib/equipment-factor.ts`) usa peso, maior dimensão e `requiresOperator` | Fator por categoria (ex.: mapa fixo `categoria → fator`) | `Context.md` §8.3 exige que categorias sejam administráveis pelo painel, não fixas no código; basear o fator logístico em um mapa `slug → número` engessaria a regra a categorias que podem mudar. Peso/dimensões/operador são campos numéricos sempre presentes no anúncio. |
| Nota pública da máquina só conta avaliação do locatário | `getMachineReviews`/`getAverageRatingsByMachineIds` (`src/features/reviews`) filtram `targetUserId = ownerId` | Somar todas as avaliações do aluguel (locatário + proprietário) na nota da máquina | A avaliação do proprietário é sobre o locatário (pessoa), não sobre o equipamento — misturá-la na nota pública do anúncio inflaria/distorceria a nota com algo que não é sobre a máquina. Sem um campo próprio de "papel" no `Review`, o `targetUserId` (sempre o proprietário quando quem avalia é o locatário, pois `CANNOT_BOOK_OWN_MACHINE` impede o proprietário de alugar a própria máquina) já identifica isso sem alterar o schema. |
| Nota média calculada em memória, não `groupBy` puro no catálogo | `getAverageRatingsByMachineIds` busca as avaliações e agrupa em JS (`src/features/reviews/services/review.service.ts`) | `prisma.review.groupBy` direto | O filtro "só avaliação do locatário" (linha acima) compara `targetUserId` com o `ownerId` de cada máquina — dois campos de tabelas diferentes, algo que `groupBy`/`where` do Prisma não expressam em uma única consulta sem SQL bruto. Mesmo padrão já adotado para distância (cálculo em app, não SQL geoespacial) — volume do MVP não justifica a complexidade extra. |
| Painel do proprietário é um hub enxuto, não o `Context.md` §8.19 inteiro | `/painel-do-proprietario` reúne só atalhos para o que já existe (Minhas máquinas, Aluguéis recebidos) + Plano Premium | Calendário, receita agregada, alertas e pendências de cadastro numa única tela | O escopo completo do §8.19 reconstruiria o que já funciona em páginas próprias sem necessidade imediata; o hub existe para dar um lar ao Plano Premium (preocupação exclusiva de quem anuncia, que não cabia no menu de perfil genérico misturado com locatário) e ao que mais vier do roadmap de parceiro. `Property` fica fora de propósito: não é exclusivo de proprietário (locatário também cadastra, como destino de entrega). |

## Valores monetários e datas

Todos os campos financeiros são `Int` (centavos inteiros) — nunca `Float`. Datas de aluguel serão
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
4. ✅ **Transação** — concluída. Solicitação de aluguel mínima (sem aprovação manual do
   proprietário — as condições do próprio anúncio são a única barreira), cálculo logístico
   (retirada, entrega pelo proprietário, transporte por parceiro simulado), composição de preço
   (prévia e retrato congelado), pagamento simulado, acompanhamento de status até a conclusão
   (transporte, entrega/retirada, uso, devolução) e cancelamento — pelo locatário ou pelo
   proprietário, a qualquer momento antes do transporte organizado, com política de estorno
   centralizada.
5. 🚧 **Confiança** — avaliações concluídas; notificações, mensagens e moderação seguem.
6. **Administração e qualidade** — painel admin, indicadores, testes, acessibilidade, segurança, documentação, deploy.
7. 🚧 **Monetização avançada** (`Context.md` §8.21/§9.7) — comissão sobre operações (8%–12%, já
   habilitada via `serviceFeeInCents` na Fase 4, cálculo ainda não implementado); ✅ Arvum Suporte
   de Operação (add-on opcional no aluguel, `src/features/support/`, antecipado desta fase); ✅ Plano
   Premium para parceiros (assinatura mensal, destaque, selo verificado, relatórios de desempenho,
   `src/features/subscriptions/`, model `Subscription`, também antecipado — redução de comissão
   pronta em `getEffectiveCommissionRate` mas ainda não conectada ao cálculo da comissão); falta
   anúncios patrocinados (posições de destaque, sempre identificados) — exige a nova entidade
   `SponsoredListing` (`Context.md` §17), inexistente no schema atual.

Adaptadores simulados (mapas/geolocalização, pagamento, transportadoras) serão introduzidos nas
fases 2–4 atrás de interfaces de serviço, permitindo substituição futura por provedores reais sem
reescrever regras de negócio.

## Fase 4 (Transação) — detalhamento

O schema (`Booking`, `BookingStatusHistory`, `LogisticsQuote`, `Payment`) já existe desde a Etapa 1
(vazio). Nenhuma rota, serviço ou tela desses módulos existe ainda. Quebrando em etapas funcionais
incrementais (`Context.md` §27/§33 — uma etapa completa e testável por vez, começando pela menor):

1. ✅ **Solicitação de aluguel (mínimo)** — a partir da página de detalhe da máquina, o locatário
   escolhe propriedade de destino e período; o servidor valida (data final > inicial, sem datas
   passadas, duração mín/máx do anúncio, sem sobreposição com `Booking` já ativo ou
   `MachineAvailability` manual) e cria o `Booking` direto em `AWAITING_PAYMENT` — sem decisão
   manual do proprietário, as condições do próprio anúncio são a única barreira —, com
   `BookingStatusHistory` desde a criação. Valor da locação já calculado (dias × diária + caução);
   logística e taxa de serviço ainda em zero — cálculo real chega na próxima etapa.
2. ✅ **Cálculo logístico** — serviço desacoplado (`src/features/logistics`, fórmula do
   `Context.md` §8.11: `taxaBase + distanciaKm × valorPorKm × fatorDoEquipamento`), reaproveitando
   `src/lib/geo` (distância entre a propriedade da máquina e a de destino) para gerar um
   `LogisticsQuote` por aluguel nas 3 modalidades. Retirada pelo locatário nunca tem custo; entrega
   pelo proprietário usa o preço que ele configurou no anúncio (ou o padrão da plataforma, se não
   configurou) e é recusada (`DELIVERY_OUT_OF_RANGE`) fora do raio de atendimento; transporte por
   parceiro usa sempre a configuração simulada da plataforma (sem parceiro real integrado). Todo
   valor calculado é rotulado como estimativa (`Context.md` §9.6/§32), pois a distância vem de
   Haversine sobre coordenadas geocodificadas de forma simulada, nunca uma rota real.
3. ✅ **Composição de preço** — tela de revisão antes de confirmar (`PriceBreakdown`): valor do
   período + logística + taxa de serviço + caução − descontos = total, com retrato dos preços
   congelado na confirmação (alterações futuras no anúncio não afetam aluguel já confirmado).
4. ❌ **Removido — Aprovação do proprietário**: existiu uma etapa de aceitar/recusar solicitações
   pendentes (`AWAITING_APPROVAL → APPROVED/REJECTED`) em `/reservas/recebidas`, decidida por
   `machine.instantBooking`. Foi removida por completo a pedido do proprietário: as condições do
   próprio anúncio (preço, prazos, disponibilidade, raio de entrega) passaram a ser a única
   barreira para um pedido ser possível, sem decisão manual extra. O campo `Machine.instantBooking`
   saiu do schema, e `decideBookingRequest`/`BookingDecisionActions`/`OwnerRequestsIndicator`
   deixaram de existir. O que sobrou do "recusar antes de decidir" foi absorvido pelo cancelamento
   unificado do item 7 abaixo — o proprietário cancela em vez de recusar, em qualquer momento antes
   do transporte organizado.
5. ✅ **Pagamento simulado** — botão "Confirmar pagamento" em `/alugueis/[id]` quando o aluguel está
   `AWAITING_PAYMENT` (estado inicial de todo aluguel, desde o item 1); cria um `Payment`
   (`src/features/payments`) sempre `APPROVED` (gateway simulado determinístico, mesmo padrão dos
   demais adaptadores simulados do projeto — nunca falha) e avança `AWAITING_PAYMENT →
   PAYMENT_CONFIRMED` numa única transação. Um aluguel só ocupa a agenda (`activeBookingStatusFilter`,
   `src/features/machines/services/machine.service.ts`) dentro de `BOOKING_HOLD_TTL_MINUTES` (30
   minutos, `src/features/bookings/lib/hold.ts`) a partir da criação — sem job em background: se o
   locatário tentar pagar depois de expirado, o aluguel é cancelado nessa mesma chamada
   (`409 BOOKING_HOLD_EXPIRED`). Só o locatário do próprio aluguel paga, verificado no servidor
   (`confirmSimulatedPayment`). Nenhum dado de cartão é coletado ou armazenado — só a forma de
   pagamento escolhida (cartão/Pix, ambos simulados).
6. ✅ **Acompanhamento de status** — um único botão de "próxima etapa" em `/alugueis/[id]`
   (locatário) e `/alugueis/recebidos/[id]` (proprietário), decidido por
   `getNextFulfillmentAction` (`src/features/bookings/lib/fulfillment.ts`): única fonte de verdade
   sobre qual é a próxima transição válida e de quem, usada tanto pela tela (qual botão mostrar)
   quanto pelo servidor (`advanceBookingFulfillment`, que verifica se o usuário logado é de fato o
   responsável antes de aplicar a transição — nunca confiando em um papel enviado pelo cliente).
   Retirada pelo locatário (`RENTER_PICKUP`) pula o rastreio de transporte: `PAYMENT_CONFIRMED →
   DELIVERED → IN_USE` (locatário confirma a retirada) `→ AWAITING_RETURN` (locatário sinaliza)
   `→ RETURNED → COMPLETED` (proprietário confirma a devolução). Entrega pelo proprietário e
   transporte por parceiro passam antes por `TRANSPORT_SCHEDULED → IN_TRANSIT` (proprietário).
   Duas transições avançam dois estados na mesma ação (mesma transação, dois registros de
   histórico): confirmar entrega/retirada já implica "em uso", e confirmar devolução já encerra o
   aluguel — no MVP não há como a plataforma detectar sozinha uma etapa intermediária entre esses
   pares de estados.
7. ✅ **Cancelamento** — `cancelBooking` (`src/features/bookings/services/booking.service.ts`)
   serve tanto o locatário quanto o proprietário; o papel é descoberto a partir do próprio aluguel,
   nunca recebido do cliente. Sem etapa de aprovação separada (ver item 4), o proprietário cancela
   pela mesma função em qualquer momento antes do transporte organizado, mesmo antes do pagamento —
   não existe mais "recusar" como ação distinta. Política centralizada em
   `src/features/bookings/lib/cancellation.ts` (`Context.md` §9.4), nunca percentuais soltos no
   serviço: sem cobrança antes do pagamento confirmado (nada foi cobrado ainda); estorno integral
   quando quem cancela é o proprietário; estorno integral ou nenhum, conforme a antecedência até o
   início do período (`CANCELLATION_POLICY.minDaysBeforeStartForFullRefund`, hoje 3 dias), quando é
   o locatário cancelando depois do pagamento confirmado. Cancelamento self-service termina em
   `PAYMENT_CONFIRMED` — a partir de `TRANSPORT_SCHEDULED` (transporte já organizado) não é mais
   oferecido, situação que o `Context.md` §9.4 trata como excepcional (disputa, fora do escopo do
   MVP). O estorno é simulado: o `Payment` aprovado do aluguel muda para `REFUNDED` na mesma
   transação que cancela o `Booking`.

Cada etapa acima foi entregue como um fluxo completo e testável (schema já existia → serviço +
validação no servidor + rota + tela mínima + testes). Com a Fase 4 completa, a Fase 5 (Confiança —
avaliações, notificações, mensagens) é a próxima: avaliações dependem de `Booking.status =
COMPLETED` existir de fato, o que agora acontece via o fluxo de acompanhamento acima.

## Fase 5 (Confiança) — detalhamento

O schema (`Review`) já existia desde a Etapa 1 (vazio). Etapas funcionais incrementais:

1. ✅ **Avaliações** — só participantes de um aluguel `COMPLETED` avaliam, uma vez cada
   (`createReview`, `src/features/reviews/services/review.service.ts`; papel descoberto a partir
   do próprio aluguel, nunca recebido do cliente — mesmo padrão de `cancelBooking`). Nota geral
   obrigatória (1–5); aspectos opcionais variam por papel — locatário avalia estado do
   equipamento, comunicação, pontualidade e experiência logística (sobre o proprietário/máquina);
   proprietário avalia só comunicação e pontualidade (sobre o locatário) — nunca pede ao
   proprietário nota de "estado do equipamento" do próprio anúncio. Formulário
   (`ReviewForm`) aparece em `/alugueis/[id]` e `/alugueis/recebidos/[id]` quando o aluguel está
   concluído e o usuário ainda não avaliou; após enviar, a mesma seção mostra a avaliação já
   registrada. A página pública de cada máquina (`/catalogo/[slug]`) e os cards do catálogo
   mostram a nota média e, no detalhe, a lista de avaliações — sempre só as do locatário sobre
   aquela máquina (nunca a avaliação que o proprietário fez do locatário, que não é sobre o
   equipamento — ver tabela de decisões acima). Componente `Rating` (`src/components/ui/Rating.tsx`)
   entra no design system (`Context.md` §12.2), com estrela cheia/vazia por glifo diferente, não só
   cor (`Context.md` §13).

Notificações e mensagens (Fase 5) e o painel de moderação (Fase 6, que passa a usar
`ReviewStatus.REPORTED`) seguem como próximas etapas.
