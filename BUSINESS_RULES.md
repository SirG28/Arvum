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
  finalidade (texto livre), necessidade de operador e período desejado. Localização/distância real
  ainda não existe (Fase 3 completa).
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

## Planejado — próximas fases

As regras abaixo já estão especificadas no `Context.md` e serão implementadas quando os módulos
correspondentes forem construídos:

- **Disponibilidade/Reservas** (Fase 4): data final posterior à inicial; sem datas passadas; sem
  sobreposição de reservas confirmadas; retrato de preços preservado no momento da confirmação.
- **Cancelamento** (Fase 4): política centralizada em serviço próprio (nunca percentuais fixos
  espalhados pelo código) — ver `Context.md` §9.4.
- **Avaliações** (Fase 5): apenas após reserva concluída; uma avaliação por participante e por
  reserva; usuário não pode avaliar a si mesmo.
- **Logística** (Fase 4): custo recalculado quando o destino muda; valores sinalizados como
  estimativa quando não houver integração real.

Valores monetários são sempre armazenados em centavos inteiros (`Int`), nunca `Float`, conforme
refletido no `prisma/schema.prisma` e nos formulários de máquinas (conversão de reais para centavos
em `src/features/machines/schemas/machine.schema.ts`).
