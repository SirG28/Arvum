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
  com `409 MACHINE_HAS_ACTIVE_BOOKINGS` quando existe aluguel em andamento (`activeBookingStatusFilter`,
  ver seção "Aluguéis" abaixo).
- **Disponibilidade**: o proprietário cadastra bloqueios manuais (`MachineAvailabilityType.MANUAL_BLOCK`)
  com data final posterior à inicial, sem datas passadas e sem sobreposição com outro bloqueio já
  existente. Os tipos `BOOKING_HOLD`/`BOOKING_CONFIRMED` continuam sem uso — o bloqueio automático por
  aluguel é resolvido comparando `Booking.status`/`startDate`/`endDate` diretamente
  (`activeBookingStatusFilter`), não por registros em `MachineAvailability`.
- **Imagens**: cadastradas por URL (campo texto) — não há upload de arquivo nem provedor de storage
  configurado neste projeto; `FileUploader` fica para quando isso existir.
- **Catálogo público**: só máquinas com status `ativo` e não removidas aparecem em `/catalogo`;
  filtro por categoria, busca textual por nome, faixa de preço (diária), marca, cultura recomendada,
  finalidade (texto livre), necessidade de operador, período desejado e localização (cidade/UF onde
  a máquina será usada), com filtro opcional por raio máximo em km.
- **Filtro por período no catálogo**: exclui máquinas com bloqueio manual (`MANUAL_BLOCK`)
  sobreposto ao período informado — mesma regra de sobreposição usada ao cadastrar um bloqueio
  (`machine-availability.service.ts`) — **e** com um aluguel ativo sobreposto
  (`activeBookingStatusFilter`, seção "Aluguéis" abaixo), nunca só uma das duas fontes.
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

### Aluguéis (Fase 4)

- Todo aluguel pertence a um locatário (`renterId`) e uma máquina; a propriedade de destino
  (`destinationPropertyId`) precisa pertencer ao próprio locatário — mesma checagem
  `getOwnedProperty` já usada pelo módulo de propriedades, nunca confiando no `id` vindo do
  cliente.
- **Um proprietário não pode alugar a própria máquina** (`CANNOT_BOOK_OWN_MACHINE`,
  verificado no servidor, não só escondendo o botão na interface).
- Data final deve ser posterior à inicial e nenhum aluguel pode começar no passado — mesma regra
  de validação dos bloqueios manuais de disponibilidade (`bookingRequestSchema`).
- A duração do período deve respeitar `minimumRentalDays`/`maximumRentalDays` do anúncio
  (`RENTAL_PERIOD_TOO_SHORT`/`RENTAL_PERIOD_TOO_LONG`).
- **Sem sobreposição**: uma solicitação é recusada (`409 MACHINE_UNAVAILABLE`) se o período colidir
  com um bloqueio manual (`MachineAvailability`) **ou** com outro aluguel já em andamento
  (`activeBookingStatusFilter`, `src/features/machines/services/machine.service.ts`). O catálogo
  público (`listActiveMachines`) aplica a mesma checagem ao filtrar por período — uma máquina com
  aluguel ativo no período buscado não aparece mais como disponível.
- **Não há aprovação manual do proprietário**: as únicas condições para um pedido ser possível são
  as do próprio anúncio (preço, prazos, disponibilidade, raio de entrega) — nunca uma decisão extra
  por pedido. Todo aluguel nasce em `AWAITING_PAYMENT`, já ocupando a agenda, com um
  `BookingStatusHistory` registrando o responsável (`changedById`) e a data — nenhuma transição de
  status ocorre sem histórico.
- **Prazo do pedido não pago** (`BOOKING_HOLD_TTL_MINUTES`, `src/features/bookings/lib/hold.ts`, 30
  minutos): um aluguel em `AWAITING_PAYMENT` só continua ocupando a agenda (contando para
  `activeBookingStatusFilter`) dentro desse prazo — depois dele, deixa de bloquear a data para
  outros locatários. Não existe job/cron: a expiração é sempre recalculada sob demanda a partir de
  `createdAt`, e o próprio `Booking` só é efetivamente marcado `CANCELLED` quando alguém tenta pagar
  um pedido já expirado (`confirmSimulatedPayment` retorna `EXPIRED`).
- **Valor da locação já é calculado nesta etapa** (dias corridos × diária do anúncio + caução do
  anúncio, quando houver — `src/features/bookings/lib/pricing.ts`), seguindo a composição do
  `Context.md` §8.12 (`total = locação + logística + taxa + caução − descontos`). A taxa de
  serviço (comissão da Arvum, `Context.md` §8.21/§9.7) entra como zero até a Fase 7 — nunca
  apresentada como estimativa final ao locatário.
- Criação do aluguel e do primeiro registro de histórico ocorre em uma única transação
  (`prisma.$transaction`), evitando um `Booking` sem histórico se a segunda escrita falhar.
- **Prévia de valores antes de solicitar**: o mesmo cálculo de disponibilidade/logística/total
  (`buildBookingQuote`) roda sem gravar nada assim que destino, período e modalidade estão
  preenchidos, para o locatário ver locação + logística + total (e qualquer impedimento, ex.:
  fora do raio de entrega) antes de confirmar — nunca só depois de enviar a solicitação. Assim que
  o pedido é criado, o locatário já é levado direto para a tela de pagamento — sem etapa
  intermediária de espera.
- **Cancelamento pelo locatário ou pelo proprietário** (`cancelBooking`,
  `src/features/bookings/services/booking.service.ts`): o mesmo serviço atende os dois lados — o
  papel de quem está cancelando é descoberto a partir do próprio aluguel (`machine.ownerId` ou
  `renterId` comparado com a sessão), nunca recebido do cliente. Não existe mais uma decisão de
  aprovar/recusar separada do cancelamento — o proprietário pode cancelar a qualquer momento antes
  do transporte ser organizado, mesmo antes do pagamento (ex.: máquina indisponível de fato). Cada
  papel tem sua janela permitida (`isBookingCancellableByRenter`/`isBookingCancellableByOwner`,
  `src/features/bookings/lib/cancellation.ts`):
  - **Locatário**: `AWAITING_PAYMENT` (antes do pagamento) ou `PAYMENT_CONFIRMED` (logo após, antes
    do transporte ser organizado).
  - **Proprietário**: `AWAITING_PAYMENT` ou `PAYMENT_CONFIRMED` — mesma janela do locatário, sem
    depender de nenhuma decisão prévia.
  - A partir de `TRANSPORT_SCHEDULED` (transporte já organizado), nenhum dos dois lados pode mais
    cancelar por autoatendimento — o `Context.md` §9.4 trata isso como situação excepcional
    (disputa), fora do escopo do MVP.
  - **Estorno** (`resolveCancellationRefund`, `Context.md` §9.4, sem percentuais soltos no
    serviço): antes de `PAYMENT_CONFIRMED` não há cobrança a estornar
    (`NOT_APPLICABLE`); cancelamento pelo proprietário é sempre estorno integral quando já houve
    pagamento; cancelamento pelo locatário depois do pagamento é integral com pelo menos
    `CANCELLATION_POLICY.minDaysBeforeStartForFullRefund` (3) dias de antecedência até o início do
    período, e sem estorno abaixo disso. O estorno é simulado: o `Payment` aprovado muda para
    `REFUNDED` na mesma transação que cancela o `Booking`. A interface explica o resultado exato
    (sem cobrança / estorno integral / sem estorno) antes de o usuário confirmar.
  - O cancelamento é sempre uma transição de status (`CANCELLED`) com `BookingStatusHistory`,
    nunca uma remoção física do registro (`Context.md` §8.4/§9.3).
- **Arvum Suporte de Operação** (`Context.md` §8.21/§9.7, antecipado da Fase 7 para a etapa de
  aluguel): add-on opcional por aluguel, nunca uma assinatura — o locatário marca ou não
  `operationSupportIncluded` no próprio formulário de solicitação, antes de confirmar. Preço fixo
  centralizado em `src/features/support/config.ts` (`OPERATION_SUPPORT_PRICE_IN_CENTS`), calculado
  por `calculateOperationSupportCost` (`src/features/support/lib/pricing.ts`) — nenhum componente
  calcula esse valor diretamente, mesmo padrão de `calculateLogisticsCost`. O valor entra em
  `calculateBookingTotals` como mais uma parcela do total (junto de locação, logística, taxa de
  serviço e caução) e é gravado como retrato imutável em `Booking.operationSupportValueInCents`. A
  interface nunca sugere cobertura financeira contra danos — os textos usam apenas "atendimento" e
  "mediação", com o aviso "não é um seguro" sempre visível junto à opção.

### Acompanhamento de status (Fase 4)

- Depois do pagamento confirmado, o aluguel avança por transições restritas por regra e
  responsável (`Context.md` §8.9), nunca por alteração arbitrária de estado.
  `getNextFulfillmentAction` (`src/features/bookings/lib/fulfillment.ts`) é a única fonte de
  verdade sobre qual é a próxima ação válida e de quem — usada tanto pela interface (qual botão
  mostrar a cada lado) quanto pelo servidor (`advanceBookingFulfillment`, que confirma que o
  usuário logado é de fato o responsável, nunca confiando em um papel enviado pelo cliente).
- **Retirada pelo locatário** (`RENTER_PICKUP`) pula o rastreio de transporte — não existe
  "agendado"/"em trânsito" quando o próprio locatário busca a máquina:
  `PAYMENT_CONFIRMED → DELIVERED → IN_USE` (locatário confirma a retirada).
- **Entrega pelo proprietário e transporte por parceiro** passam por
  `PAYMENT_CONFIRMED → TRANSPORT_SCHEDULED → IN_TRANSIT → DELIVERED → IN_USE`, todas as
  transições de responsabilidade do proprietário até a entrega.
- **Devolução**, igual para as três modalidades: `IN_USE → AWAITING_RETURN` (locatário sinaliza
  que o uso terminou) `→ RETURNED → COMPLETED` (proprietário confirma que recebeu a máquina de
  volta, o que já encerra o aluguel).
- Duas ações avançam dois estados de uma vez, na mesma transação e com dois registros de
  histórico: confirmar entrega/retirada já significa "em uso" no mesmo instante, e confirmar
  devolução já encerra o aluguel — no MVP não há uma etapa intermediária que a plataforma consiga
  detectar sozinha entre esses pares de estados (`Context.md` §27: escolher a alternativa mais
  simples e registrar a decisão).

### Pagamento simulado (Fase 4)

- Gateway simulado (`confirmSimulatedPayment`, `src/features/payments`): sem integração real, sem
  dado de cartão coletado ou armazenado — só a forma de pagamento escolhida
  (`CREDIT_CARD`/`PIX`, ambos rótulos "(simulado)" na interface). Resultado sempre `APPROVED`,
  mesmo padrão determinístico dos demais adaptadores simulados do projeto (geocodificação,
  transporte por parceiro) — nunca falha nesta etapa.
- **Só é possível pagar um aluguel em `AWAITING_PAYMENT`**: outra tentativa retorna `409
  BOOKING_NOT_AWAITING_PAYMENT` — não é possível pagar duas vezes o mesmo aluguel (a segunda
  tentativa encontra o aluguel já em `PAYMENT_CONFIRMED`). Se o prazo do hold já tiver expirado
  (`isPaymentHoldExpired`, `src/features/bookings/lib/hold.ts`), o aluguel é cancelado nessa mesma
  chamada e a resposta é `409 BOOKING_HOLD_EXPIRED`, em vez de aceitar um pagamento fora do prazo.
- **Só o próprio locatário paga o seu aluguel**, verificado no servidor (`renterId` comparado com
  a sessão), nunca confiando em dado vindo do cliente.
- A confirmação avança `AWAITING_PAYMENT → PAYMENT_CONFIRMED` numa única transação, com
  `BookingStatusHistory` registrando a transição.

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
  a propriedade da máquina e a propriedade de destino do aluguel. Sem coordenada geocodificada de
  algum dos dois lados, o aluguel é recusado (`422 DESTINATION_DISTANCE_UNKNOWN`) em vez de
  calcular um custo com distância zero.
- Todo valor calculado é rotulado como **estimativa** na interface (`Context.md` §9.6/§32): a
  distância vem de coordenadas geocodificadas de forma simulada, nunca de uma rota real.
- Um `LogisticsQuote` é criado na mesma transação do `Booking`, já em `ACCEPTED` — não existe,
  nesta etapa, um fluxo separado de escolha entre cotações concorrentes.

### Avaliações (Fase 5)

- **Só após o aluguel concluído** (`Booking.status = COMPLETED`) — locatário e proprietário podem
  se avaliar, um do outro, uma única vez por aluguel. A constraint `@@unique([bookingId, authorId])`
  garante isso no banco; o serviço (`createReview`) checa antes e devolve `409 ALREADY_REVIEWED`
  para uma mensagem clara, em vez de deixar o erro de banco vazar.
- **O papel de quem avalia é descoberto a partir do próprio aluguel** (`renterId` ou
  `machine.ownerId` comparado com a sessão), nunca recebido do cliente — mesmo padrão de
  `cancelBooking`/`advanceBookingFulfillment`. Quem não participou do aluguel recebe `404
  BOOKING_NOT_FOUND` (nunca `403`, para não revelar a existência do aluguel a quem é estranho a
  ele).
- **Nota geral (1 a 5) é obrigatória**; os aspectos são opcionais e variam por papel
  (`Context.md` §8.14: separar estado do equipamento, comunicação, pontualidade e experiência
  logística). O locatário pode avaliar os quatro aspectos, sempre sobre o proprietário/máquina; o
  proprietário só avalia comunicação e pontualidade, sempre sobre o locatário — nunca pede a ele
  uma nota de "estado do equipamento" do próprio anúncio, nem ao locatário uma nota sobre si mesmo.
  O servidor descarta silenciosamente aspectos fora do papel de quem envia (`createReview`), em vez
  de confiar apenas na interface para escondê-los.
- **Nota média sempre recalculada a partir do conjunto atual de avaliações publicadas**
  (`calculateAverageRating`, `src/features/reviews/lib/rating.ts`) — nunca um contador incremental
  guardado à parte, evitando divergência se uma avaliação for ocultada pela moderação (Fase 6,
  `ReviewStatus.HIDDEN`/`REPORTED`, ainda sem painel para acioná-la).
- **A nota pública de uma máquina conta só as avaliações de quem alugou** (`targetUserId` igual ao
  `ownerId` da máquina) — a avaliação que o proprietário faz do locatário é sobre a pessoa, não
  sobre o equipamento, e não aparece na página da máquina nem entra na sua nota média. Como o
  proprietário nunca pode alugar a própria máquina (`CANNOT_BOOK_OWN_MACHINE`, regra de Aluguéis
  acima), esse filtro por `targetUserId` isola corretamente as duas direções sem exigir um campo de
  papel a mais no `Review`.
- Comentário é opcional (até 1000 caracteres); avaliações não podem ser anônimas para a
  plataforma — o autor é sempre o usuário autenticado, nunca um campo de texto livre.

### Plano Premium para parceiros (`Context.md` §8.21/§9.7/§17, antecipado da Fase 7)

- **Assinatura mensal por proprietário, preço único** (R$ 149,90 — ponto médio da faixa R$ 99–199
  do `Context.md`), sem tiers e sem tabela de preços no banco (`src/features/subscriptions/config.ts`,
  mesmo padrão do preço fixo do Suporte de Operação). Um único registro por proprietário
  (`Subscription.ownerId @unique`) — assinar de novo sempre reescreve o mesmo registro com um
  período novo de 30 dias, nunca uma tabela de histórico de cobranças.
- **Sem simulação de renovação automática de verdade**: o projeto não tem scheduler/cron
  (`Context.md` §27). Assinar sempre inicia um período novo a partir de agora, pelo preço atual —
  sem carregar tempo restante de uma assinatura anterior. Cancelar (`cancelPremiumSubscription`,
  `src/features/subscriptions/services/subscription.service.ts`) só impede a renovação futura; o
  `currentPeriodEnd` nunca é alterado, então os benefícios continuam até lá (`Context.md` §9.7: "o
  cancelamento não reduz retroativamente benefícios já utilizados no período pago").
- **"Ativo" é sempre calculado a partir de `currentPeriodEnd`**, nunca só do `status` armazenado
  (`isPremiumActive`, `src/features/subscriptions/lib/subscription-status.ts`) — sem renovação real,
  um registro pode ficar com `status: ACTIVE` no banco depois que o período expirou; o `status`
  serve só para a mensagem certa na tela (ativa vs. cancelada mas ainda dentro do período).
- **Destaque no catálogo**: `listActiveMachines`/`getPublicMachineBySlug`
  (`src/features/machines/services/machine.service.ts`) carregam o status da assinatura do
  proprietário e aplicam `sortByPremiumFirst` (`src/features/machines/lib/premium-boost.ts`, sort
  estável testado) — reordena colocando parceiros Premium primeiro sem descartar a ordenação por
  distância/data já aplicada. Selo "Parceiro verificado" no card do catálogo
  (`CatalogMachineCard.tsx`) e na página de detalhe, sempre condicionado a `isPremiumActive`.
- **Redução de comissão pronta, mas não conectada**: `getEffectiveCommissionRate`
  (`src/features/subscriptions/lib/commission.ts`) retorna a taxa reduzida para parceiros Premium —
  função centralizada e testada, seguindo a regra do `Context.md` §9.7 ("a regra de redução deve
  ficar centralizada em serviço próprio, nunca espalhada pelo fluxo de pagamento"), mas ainda não é
  chamada por nenhum serviço: a comissão em si (`Booking.serviceFeeInCents`) ainda não é calculada
  em lugar nenhum do projeto (Fase 7 pendente).
- **Relatório de desempenho usa só dados que já existem** (`getOwnerPerformanceReport`,
  `src/features/subscriptions/services/report.service.ts`): aluguéis por status, receita total
  (soma de `totalValueInCents` dos aluguéis com pagamento confirmado em diante — constante própria
  `PAID_BOOKING_STATUSES`, diferente de `ACTIVE_BOOKING_STATUSES` do `machine.service.ts`, que
  exclui `COMPLETED` e não serve para receita) e nota média (reaproveita `getUserReviewSummary`, já
  usada em `/perfil`). Nenhuma contagem de visualizações — não há tracking de página no projeto.
- **Painel do proprietário** (`Context.md` §8.19, hub enxuto — não a especificação inteira):
  `/painel-do-proprietario` reúne atalhos para o que é exclusivo de quem anuncia máquinas (Minhas
  máquinas, Aluguéis recebidos) e a gestão do Plano Premium. `Property` fica de fora — não é
  exclusivo de proprietário, um locatário também cadastra propriedade como destino de entrega no
  aluguel, então "Minhas propriedades" continua só no menu de perfil geral. "Minhas máquinas" saiu
  do menu de perfil genérico (`profileItems.tsx`) por estar centralizada no painel; "Aluguéis
  recebidos" também nunca esteve lá. Sem etapa de aprovação, não existe mais nenhuma pendência
  urgente do proprietário para justificar um atalho fixo no cabeçalho — o indicador
  `OwnerRequestsIndicator.tsx` foi removido; o cabeçalho só mostra `RentalsIndicator.tsx`
  (`/alugueis`), relevante para qualquer conta, locatária ou proprietária.

## Planejado — próximas fases

As regras abaixo já estão especificadas no `Context.md` e serão implementadas quando os módulos
correspondentes forem construídos:

- **Retrato de preços preservado**: alterações futuras no anúncio não podem mudar retroativamente
  o valor de um aluguel já confirmado (vale desde já, pois os valores são gravados no `Booking` no
  momento da criação — falta apenas garantir que nenhuma tela recalcule usando o anúncio atual).
- **Moderação de avaliações** (Fase 6): denúncia de comentário e ocultação pela moderação
  (`ReviewStatus.REPORTED`/`HIDDEN` já existem no schema, sem painel para acioná-los ainda).
- **Monetização** (Fase 7 — `Context.md` §8.21/§9.7): modelo híbrido com três entradas — comissão de
  8%–12% sobre cada operação (retida automaticamente na divisão do pagamento, sem cobrança separada
  ao locatário), assinatura mensal do Plano Premium para parceiros e anúncios patrocinados (sempre
  identificados, nunca misturados a resultados orgânicos). O Arvum Suporte de Operação (ver seção
  "Aluguéis") e o Plano Premium (ver seção "Parceiros" acima, incluindo `Subscription` no schema)
  já estão implementados — o que falta da Fase 7 é só a comissão em si (a comissão reaproveitaria o
  campo já existente `Booking.serviceFeeInCents`; a redução para parceiros Premium já está pronta e
  testada em `getEffectiveCommissionRate`, só falta ser chamada) e os anúncios patrocinados (exigem
  a entidade `SponsoredListing`, `Context.md` §17, ainda inexistente no schema).

Valores monetários são sempre armazenados em centavos inteiros (`Int`), nunca `Float`, conforme
refletido no `prisma/schema.prisma` e nos formulários de máquinas (conversão de reais para centavos
em `src/features/machines/schemas/machine.schema.ts`).
