# Regras de negócio — Arvum

Referência completa: [`Context.md`](./Context.md) §9. Este documento lista o que já está
implementado e o que é planejado para as próximas fases.

## Implementado

### Usuários

- E-mail é único (`User.email @unique`).
- Senha nunca é armazenada em texto puro — sempre hash `bcryptjs` (10 salt rounds).
- Uma mesma conta pode futuramente atuar como locatária e proprietária (não há separação de tipo
  de conta no modelo de dados).
- Cadastro com e-mail já existente retorna erro específico (`email: ["Este e-mail já está
cadastrado."]`), nunca uma mensagem genérica.
- Login exige `status = ACTIVE` e `deletedAt = null`.

### Propriedades

- Toda propriedade pertence a um único dono (`ownerId`).
- Apenas o dono pode ler, editar ou remover suas propriedades — verificado no servidor em toda
  operação (`getOwnedProperty` compara `ownerId` com a sessão autenticada), nunca confiando em
  dado vindo do cliente.
- Exclusão de propriedade é bloqueada (`409 PROPERTY_HAS_MACHINES`) quando existe ao menos uma
  máquina vinculada — protege integridade referencial sem exigir soft delete.
- Toda validação de propriedade (nome, endereço, cidade, UF, CEP) é reforçada no servidor via Zod,
  independentemente da validação client-side em `react-hook-form`.

### Máquinas (Fase 2 — Oferta)

- Cada máquina pertence a um único proprietário (`ownerId`); apenas o dono lê/edita/gerencia suas
  máquinas, verificado no servidor (`getOwnedMachine`), nunca confiando em dado vindo do cliente.
- Ao cadastrar ou editar, a propriedade informada (`propertyId`) precisa pertencer ao mesmo
  proprietário — reaproveita a checagem `getOwnedProperty` já usada pelo módulo de propriedades.
- Categorias vêm sempre do banco (`MachineCategory`), nunca de uma lista fixa no código.
- **Status do anúncio** segue uma máquina de estados explícita (`rascunho → ativo`, `ativo ⇄
  pausado`, qualquer estado não arquivado → `arquivado`, que é terminal). Publicar (`→ ativo`)
  exige ao menos uma imagem cadastrada — anúncio incompleto não pode ser publicado. Os status
  `aguardando análise`/`recusado` existem no schema para quando o painel de moderação (Fase 6)
  existir, mas não há ação do proprietário para eles hoje — sem um revisor, não há "aguardando
  análise" de fato.
- **Exclusão é sempre lógica** (`deletedAt`), nunca física — ao contrário de `Property`. É bloqueada
  com `409 MACHINE_HAS_ACTIVE_BOOKINGS` quando existe reserva em andamento (a tabela `Booking` já
  existe desde a Etapa 1, ainda vazia até a Fase 4).
- **Disponibilidade**: o proprietário cadastra bloqueios manuais (`MachineAvailabilityType.MANUAL_BLOCK`)
  com data final posterior à inicial, sem datas passadas e sem sobreposição com outro bloqueio já
  existente. Os tipos `BOOKING_HOLD`/`BOOKING_CONFIRMED` (bloqueio automático por reserva) ficam
  para a Fase 4, quando o módulo de reservas existir.
- **Imagens**: cadastradas por URL (campo texto) — não há upload de arquivo nem provedor de storage
  configurado neste projeto; `FileUploader` fica para quando isso existir.
- **Catálogo público**: só máquinas com status `ativo` e não removidas aparecem em `/catalogo`;
  filtro por categoria, busca textual por nome, faixa de preço (diária), marca, cultura recomendada,
  finalidade (texto livre), necessidade de operador, período desejado e localização (cidade/UF onde
  a máquina será usada), com filtro opcional por raio máximo em km.
- **Filtro por período no catálogo**: exclui máquinas com bloqueio manual (`MANUAL_BLOCK`)
  sobreposto ao período informado — mesma regra de sobreposição usada ao cadastrar um bloqueio
  (`machine-availability.service.ts`). Reservas (`Booking`) ainda não existem (Fase 4), então não há
  confirmação adicional a considerar por enquanto.
- **Filtros inválidos são tolerados, não bloqueiam a busca**: uma combinação impossível (preço
  mínimo maior que o máximo, ou apenas uma das duas datas do período) é descartada com um aviso na
  tela — os demais filtros continuam valendo, em vez de invalidar a busca inteira
  (`catalog-filters.schema.ts`).
- **Marca e cultura são selecionáveis a partir dos anúncios ativos** (`listCatalogFilterOptions`),
  nunca uma lista fixa — evita oferecer um filtro que sempre retorna vazio.
- **Localização e distância estimada**: nenhuma propriedade coleta latitude/longitude
  manualmente — ao criar ou editar (`property.service.ts`), a coordenada é preenchida
  automaticamente a partir de cidade/UF por um adaptador de geocodificação simulado
  (`src/lib/geo/geocoding.ts`, sem API externa configurada). No catálogo, o locatário informa "onde
  vai usar" (cidade/UF); a distância até cada máquina é calculada com a fórmula de Haversine
  (`src/lib/geo/distance.ts`) sobre as coordenadas já persistidas — nunca por uma API de rotas real.
  Máquinas cuja propriedade não tem coordenada resolvida (UF desconhecida) ficam sem distância, mas
  continuam aparecendo na busca. Quando uma localização é informada, os resultados são ordenados por
  distância crescente; o raio máximo (`raioMax`) é ignorado (com aviso) se nenhuma localização for
  informada, seguindo o mesmo padrão tolerante dos demais filtros. A distância é sempre rotulada
  "estimativa" na interface — nunca apresentada como medição real (`Context.md` §32).

### Favoritos

- Restrito a usuários autenticados; anônimo vê o coração como link para o login (preserva a
  página atual em `callbackUrl`), nunca uma ação que falha silenciosamente.
- Duplicidade é impedida em dois níveis: `@@unique([userId, machineId])` no banco e checagem
  explícita no serviço (`ALREADY_FAVORITED` → `409`), nunca dependendo só da constraint do banco
  para dar uma mensagem clara.
- Favoritar uma máquina removida (`deletedAt` preenchido) é bloqueado (`404
  MACHINE_NOT_FOUND`); máquina pausada/arquivada depois de favoritada continua listada em
  `/favoritos`, mas sem link para a página de detalhe (que devolveria 404) — mostra o status em
  vez disso.
- `/favoritos` é uma rota protegida pelo `middleware.ts`, mesmo padrão de `/propriedades`,
  `/maquinas` e `/perfil`.

### Reservas (Fase 4 — solicitação mínima)

- Toda reserva pertence a um locatário (`renterId`) e uma máquina; a propriedade de destino
  (`destinationPropertyId`) precisa pertencer ao próprio locatário — mesma checagem
  `getOwnedProperty` já usada pelo módulo de propriedades, nunca confiando no `id` vindo do
  cliente.
- **Um proprietário não pode reservar a própria máquina** (`CANNOT_BOOK_OWN_MACHINE`,
  verificado no servidor, não só escondendo o botão na interface).
- Data final deve ser posterior à inicial e nenhuma reserva pode começar no passado — mesma regra
  de validação dos bloqueios manuais de disponibilidade (`bookingRequestSchema`).
- A duração do período deve respeitar `minimumRentalDays`/`maximumRentalDays` do anúncio
  (`RENTAL_PERIOD_TOO_SHORT`/`RENTAL_PERIOD_TOO_LONG`).
- **Sem sobreposição**: uma solicitação é recusada (`409 MACHINE_UNAVAILABLE`) se o período colidir
  com um bloqueio manual (`MachineAvailability`) **ou** com outra reserva já em andamento (todo
  status exceto `CANCELLED`/`COMPLETED` — mesma lista `ACTIVE_BOOKING_STATUSES` que já impedia a
  remoção da máquina). O catálogo público (`listActiveMachines`) aplica a mesma checagem de
  reservas ativas ao filtrar por período — uma máquina com reserva confirmada no período buscado
  não aparece mais como disponível.
- **Confirmação automática vs. aprovação manual**: decidida pelo anúncio (`machine.instantBooking`),
  nunca escolhida pelo locatário no momento da reserva. Reserva instantânea nasce em `APPROVED`;
  as demais nascem em `AWAITING_APPROVAL`. Toda criação registra uma `BookingStatusHistory` com o
  responsável (`changedById`) e a data — nenhuma transição de status ocorre sem histórico.
- **Aprovação/recusa pelo proprietário**: única transição possível a partir de
  `AWAITING_APPROVAL` (`decideBookingRequest`) — `APPROVED` ou `REJECTED`, com motivo opcional que
  fica registrado no `BookingStatusHistory` (nunca um campo separado no `Booking`). Só o
  proprietário da máquina decide, verificado no servidor (`getBookingForOwner` compara
  `machine.ownerId` com a sessão, nunca confiando em dado vindo do cliente); uma solicitação já
  decidida ou fora de `AWAITING_APPROVAL` é recusada (`409 BOOKING_NOT_PENDING`) — não existe
  "reaprovar" ou reverter uma decisão. Reserva instantânea nunca passa por essa transição, pois já
  nasce em `APPROVED`.
- **Valor da locação já é calculado nesta etapa** (dias corridos × diária do anúncio + caução do
  anúncio, quando houver — `src/features/bookings/lib/pricing.ts`), seguindo a composição do
  `Context.md` §8.12 (`total = locação + logística + taxa + caução − descontos`). A taxa de
  serviço (comissão da Arvum, `Context.md` §8.21/§9.7) entra como zero até a Fase 7 — nunca
  apresentada como estimativa final ao locatário.
- Criação da reserva e do primeiro registro de histórico ocorre em uma única transação
  (`prisma.$transaction`), evitando um `Booking` sem histórico se a segunda escrita falhar.
- **Prévia de valores antes de solicitar**: o mesmo cálculo de disponibilidade/logística/total
  (`buildBookingQuote`) roda sem gravar nada assim que destino, período e modalidade estão
  preenchidos, para o locatário ver locação + logística + total (e qualquer impedimento, ex.:
  fora do raio de entrega) antes de confirmar — nunca só depois de enviar a solicitação.
- **Cancelamento pelo locatário**: permitido enquanto a reserva está em `DRAFT`,
  `AWAITING_APPROVAL`, `APPROVED` ou `AWAITING_PAYMENT` — todos os estados "antes do pagamento"
  do `Context.md` §9.4, sem cobrança. Como o módulo de pagamento ainda não existe, toda reserva
  hoje se enquadra nesse caso; a política de estorno após pagamento confirmado fica para quando o
  `Payment` existir. O cancelamento é sempre uma transição de status (`CANCELLED`) com
  `BookingStatusHistory`, nunca uma remoção física do registro (`Context.md` §8.4/§9.3).

### Pagamento simulado (Fase 4)

- Gateway simulado (`confirmSimulatedPayment`, `src/features/payments`): sem integração real, sem
  dado de cartão coletado ou armazenado — só a forma de pagamento escolhida
  (`CREDIT_CARD`/`PIX`, ambos rótulos "(simulado)" na interface). Resultado sempre `APPROVED`,
  mesmo padrão determinístico dos demais adaptadores simulados do projeto (geocodificação,
  transporte por parceiro) — nunca falha nesta etapa.
- **Só é possível pagar uma reserva `APPROVED`**: outra tentativa retorna `409
  BOOKING_NOT_APPROVED` — não é possível pagar antes da aprovação do proprietário nem pagar duas
  vezes a mesma reserva (a segunda tentativa encontra a reserva já em `AWAITING_PAYMENT` ou
  `PAYMENT_CONFIRMED`, não mais `APPROVED`).
- **Só o próprio locatário paga a sua reserva**, verificado no servidor (`renterId` comparado com
  a sessão), nunca confiando em dado vindo do cliente.
- A confirmação avança `APPROVED → AWAITING_PAYMENT → PAYMENT_CONFIRMED` na mesma transação, com
  `BookingStatusHistory` registrando as duas transições — como o "processamento" é instantâneo
  nesta simulação, não há espera real entre elas, mas o histórico preserva a sequência completa
  descrita no `Context.md` §8.9.

### Cálculo logístico (Fase 4)

- Fórmula centralizada em `src/features/logistics/lib/pricing.ts` (`Context.md` §8.11):
  `custoLogistico = taxaBase + (distanciaKm × valorPorKm × fatorDoEquipamento)` — nunca espalhada
  pelos componentes de interface.
- **Retirada pelo locatário** (`RENTER_PICKUP`) nunca tem custo logístico — o locatário organiza o
  próprio transporte (`Context.md` §8.10).
- **Entrega pelo proprietário** (`OWNER_DELIVERY`) usa o preço que o proprietário configurou no
  anúncio (`Machine.deliveryPricePerKmInCents`/`deliveryBaseFeeInCents`, opcionais); sem
  configuração própria, cai no padrão da plataforma (`src/features/logistics/config.ts`). É
  **recusada** (`409 DELIVERY_OUT_OF_RANGE`) quando a distância até a propriedade de destino
  excede `Machine.deliveryRadiusKm`, ou quando o anúncio não define raio de entrega — nunca
  aceita silenciosamente fora do alcance combinado.
- **Transporte por parceiro** (`PARTNER_TRANSPORT`) sempre usa a configuração simulada da
  plataforma — não há parceiro logístico real integrado (`Context.md` §8.10), então não existe
  quem definiria um preço por máquina.
- **Fator do equipamento**: calculado a partir de peso, maior dimensão e necessidade de operador
  (`src/features/logistics/lib/equipment-factor.ts`) — nunca da categoria, que é administrável
  pelo painel e não deve virar regra hardcoded no código (`Context.md` §8.3).
- A distância usada é a mesma fórmula de Haversine do catálogo (`src/lib/geo/distance.ts`), entre
  a propriedade da máquina e a propriedade de destino da reserva. Sem coordenada geocodificada de
  algum dos dois lados, a reserva é recusada (`422 DESTINATION_DISTANCE_UNKNOWN`) em vez de
  calcular um custo com distância zero.
- Todo valor calculado é rotulado como **estimativa** na interface (`Context.md` §9.6/§32): a
  distância vem de coordenadas geocodificadas de forma simulada, nunca de uma rota real.
- Um `LogisticsQuote` é criado na mesma transação do `Booking`, já em `ACCEPTED` — não existe,
  nesta etapa, um fluxo separado de escolha entre cotações concorrentes.

## Planejado — próximas fases

As regras abaixo já estão especificadas no `Context.md` e serão implementadas quando os módulos
correspondentes forem construídos:

- **Cancelamento** (Fase 4): política centralizada em serviço próprio (nunca percentuais fixos
  espalhados pelo código) — ver `Context.md` §9.4.
- **Retrato de preços preservado**: alterações futuras no anúncio não podem mudar retroativamente
  o valor de uma reserva já confirmada (vale desde já, pois os valores são gravados no `Booking` no
  momento da criação — falta apenas garantir que nenhuma tela recalcule usando o anúncio atual).
- **Avaliações** (Fase 5): apenas após reserva concluída; uma avaliação por participante e por
  reserva; usuário não pode avaliar a si mesmo.
- **Monetização** (Fase 7 — `Context.md` §8.21/§9.7): modelo híbrido com três entradas — comissão de
  8%–12% sobre cada operação (retida automaticamente na divisão do pagamento, sem cobrança separada
  ao locatário), assinatura mensal do Plano Premium para parceiros (R$ 99–199, com desconto na
  comissão, destaque na busca, selo de verificado e relatórios de desempenho) e anúncios
  patrocinados (sempre identificados, nunca misturados a resultados orgânicos). A comissão reaproveita
  o campo já existente `Booking.serviceFeeInCents`; Plano Premium e anúncios patrocinados exigem as
  novas entidades `Subscription` e `SponsoredListing` (`Context.md` §17). O Arvum Suporte de Operação
  é um add-on opcional por reserva — suporte operacional, não seguro, sem cobertura financeira contra
  danos.

Valores monetários são sempre armazenados em centavos inteiros (`Int`), nunca `Float`, conforme
refletido no `prisma/schema.prisma` e nos formulários de máquinas (conversão de reais para centavos
em `src/features/machines/schemas/machine.schema.ts`).
