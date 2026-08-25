# Motion — Arvum

Referência: [`Context.md`](./Context.md) §11 (Experiência do usuário), §12.1 (tokens do design
system) e §13 (Acessibilidade). Este documento registra os princípios, os tokens e o mapeamento de
motion na interface — o que já existe, o que foi implementado e o que está planejado.

## Princípios

1. **Funcional, não decorativo** — toda animação existe para comunicar causa/efeito, estado ou
   hierarquia (abrir um menu, confirmar uma ação, indicar carregamento). Coerente com a
   simplicidade exigida em `Context.md` §6 para um público com diferentes níveis de familiaridade
   digital.
2. **Consistência via tokens** — mesma lógica que já rege cor/espaçamento/raio no `@theme`:
   duração e easing centralizados, nunca valores soltos por componente (`Context.md` §12.1).
3. **Performance** — animar só `transform`/`opacity` (GPU), nunca `width`/`height`/`top`
   diretamente — público prioritariamente mobile (`Context.md` §11.1/§14).
4. **Acessibilidade obrigatória** — respeitar `prefers-reduced-motion: reduce` é requisito
   explícito do próprio `Context.md` §13.
5. **Feedback imediato** — toda ação importante já deve ter feedback (`Context.md` §11.1/§11.5);
   motion reforça visualmente esse feedback (toast, sucesso, erro, favoritar).
6. **Hierarquia de tempo** — micro-interações (hover, toggle) mais rápidas que overlays
   (modal, dropdown, drawer), que são mais rápidas que transições de página. Nada acima de
   ~300ms na interface principal.

## Diagnóstico anterior a este documento

- Tokens de duração existiam desde a Etapa 1 (`--animate-duration-fast`/`--animate-duration-base`
  em `globals.css`), mas em um namespace que o Tailwind v4 não usa para gerar utilitários
  `duration-*` (`--animate-*` gera atalhos `animate-*`, como `animate-spin` — não durações). O
  resultado: dois tokens declarados e nunca consumidos por nenhum componente.
- Nenhuma regra `prefers-reduced-motion` existia no projeto, apesar de ser requisito explícito do
  `Context.md` §13.
- Só existiam transições de hover/focus (`transition-colors`/`transition-shadow`) em componentes
  como `Button`, `Input`, `IconButton`, cards e links.
- `Modal`/`ConfirmationDialog`, `Toast`, `ProfileMenu` (dropdown) e `MobileNavDrawer` aparecem e
  desaparecem instantaneamente (mount/unmount direto do React, sem transição).
- `MenuIcon` já alterna hambúrguer↔X por troca de `path` (`open` prop), mas sem transição entre os
  dois estados.

## Tokens (Etapa 1 — concluída)

| Token | Valor | Namespace Tailwind v4 | Utilitário gerado |
| --- | --- | --- | --- |
| `--duration-fast` | 120ms | `--duration-*` → `duration-*` | `duration-fast` |
| `--duration-base` | 200ms | `--duration-*` → `duration-*` | `duration-base` |
| `--duration-slow` | 320ms (novo) | `--duration-*` → `duration-*` | `duration-slow` |

Renomeados de `--animate-duration-fast`/`--animate-duration-base` para `--duration-fast`/
`--duration-base` — mesmo valor, namespace corrigido para que o Tailwind gere as classes
utilitárias automaticamente (`Context.md` §12.1: tokens centralizados, não valores soltos).

Easing **não precisou de token novo**: o Tailwind v4 já define `--ease-in`, `--ease-out` e
`--ease-in-out` no tema padrão (`cubic-bezier` equivalentes ao padrão de motion de UI — saída
acelera, entrada desacelera) — usar as classes `ease-out`/`ease-in`/`ease-in-out` já existentes,
sem duplicar.

Uso esperado: `transition-opacity duration-base ease-out` (entrada), `duration-fast ease-in`
(saída), `duration-slow` reservado para transições de página/stepper.

## `prefers-reduced-motion` (Etapa 1 — concluída)

Regra global em `globals.css` que zera durações de transição/animação para quem ativou "reduzir
movimento" no sistema operacional — fecha a lacuna do `Context.md` §13, que exigia isso desde a
especificação original mas nunca foi implementado.

## Mapeamento por componente

### Prioridade alta — lacunas de feedback já cobradas pelo `Context.md`

| Componente | Estado atual | Motion planejado |
| --- | --- | --- |
| ✅ `Modal` / `ConfirmationDialog` | backdrop fade (opacity); diálogo fade+scale (0.95→1) na entrada e na saída | — |
| ✅ `Toast` (`ToastProvider`) | slide+fade de baixo (mobile) ou da direita (desktop) na entrada; fade+shrink na saída | — |
| ✅ `ProfileMenu` (dropdown) | fade+scale a partir do canto superior direito (`origin-top-right`) | — |
| ✅ `MobileNavDrawer` (painel mobile) | slide down + fade | — |
| ✅ `MenuIcon` | três linhas fixas giram/desaparecem via transform/opacity (nunca troca `d` de path) | — |

### Prioridade média — reforço de estado e hierarquia

| Componente | Motion | Status |
| --- | --- | --- |
| ✅ `FavoriteButton` (coração) | "pop" de escala ao favoritar | — |
| ✅ `Alert` / mensagens de erro de formulário | fade+slide sutil ao aparecer, evitando salto de layout (`Context.md` §11.4) | — |
| ✅ `CatalogMachineCard` / `Card` (hover) | já tinha `transition-shadow`; somado leve `translateY` | — |
| Resultados do catálogo ao filtrar | ❌ não aplicável — ver nota abaixo | — |
| ✅ `PriceBreakdown` (prévia de valores no `BookingRequestForm`) | fade+slide ao aparecer pela primeira vez | — |
| ✅ Acompanhamento de status da reserva (fulfillment) | destacar a transição do estado atual na timeline | — |

**Nota — catálogo ao filtrar**: o item original presumia um fetch client-side com estado de
carregando para fazer crossfade. Na prática, `/catalogo` (`src/app/catalogo/page.tsx`) é um Server
Component com filtros aplicados via `<form method="get">` — cada filtro é uma navegação de página
inteira, não uma requisição client-side. Não há um estado de "carregando" para crossfade sem mudar
a arquitetura de busca (fora do escopo de uma etapa de motion). Descartado, não implementado.

### Prioridade baixa / avaliar depois

- Transições entre rotas (ex.: catálogo → detalhe da máquina) — só se não gerar percepção de
  lentidão.
- Componentes ainda não construídos (`Skeleton`, `Drawer` genérico, `Stepper` — `Context.md`
  §12.2) já nascem com motion desde o início quando forem implementados.

## Roadmap incremental

1. ✅ **Tokens de duração + `prefers-reduced-motion`** — namespace corrigido, token `slow`
   adicionado, regra global de acessibilidade.
2. ✅ **Overlays críticos** — `Modal`/`ConfirmationDialog` e `Toast` (detalhes abaixo).
3. ✅ **Navegação** — `ProfileMenu`, `MobileNavDrawer`, `MenuIcon` (detalhes abaixo).
4. ✅ **Reforços pontuais** — favoritar, alerts, price breakdown, catálogo (detalhes abaixo).
5. ✅ **Destaque de transição de status** — timeline de acompanhamento da reserva (detalhes abaixo).
6. ✅ **Feedback de clique + skeleton de página** — `Skeleton` (detalhes abaixo).
7. ⏳ **Componentes futuros** — `Drawer`, `Stepper` já nascem com motion.

### Etapa 2 — detalhamento

Os dois componentes precisavam continuar montados durante a saída para poder animar antes do
unmount — o React não anima elementos removidos da árvore instantaneamente. Padrão adotado nos
dois (`Modal.tsx`, `Toast.tsx`):

- Um estado `visible` controla as classes de opacidade/transform; ele só vira `true` um frame
  (`requestAnimationFrame`) depois da montagem, para o navegador ter uma chance de pintar o estado
  "oculto" antes de transicionar para o estado "visível" (sem isso, a transição não roda — o
  elemento nasceria já no estado final).
- Na saída, o estado volta para `false`, disparando a transição CSS reversa; o componente só é de
  fato desmontado (`Modal`) ou removido da lista (`Toast`, via `onExited` do `ToastProvider`)
  quando o evento `onTransitionEnd` da propriedade `opacity` confirma que a transição terminou —
  nunca no mesmo tick em que o fechamento é pedido.
- **Caso de borda tratado**: se o componente for fechado antes do frame de entrada rodar (aba em
  segundo plano, fechamento muito rápido), a classe CSS nunca chega a mudar — logo
  `onTransitionEnd` nunca dispara, e o componente ficaria preso montado para sempre. Uma ref
  (`hasEnteredRef`) rastreia se o frame de entrada já rodou; se não, o fechamento desmonta/remove
  direto, sem esperar por um evento que nunca viria. Esse caso foi encontrado e corrigido durante a
  verificação manual desta etapa (aba oculta impede `requestAnimationFrame` de rodar).
- `Toast` ganhou as props `leaving`/`onExited`; `ToastProvider` mantém o item na lista com
  `leaving: true` até `onExited` confirmar a saída, em vez de remover o item do array
  imediatamente ao pedir o dismiss (manual ou automático).

### Etapa 3 — detalhamento

O padrão da Etapa 2 (montado durante a saída, `visible` revelado um frame depois de montar,
desmonte só após `onTransitionEnd`, com o guard de "fechado antes de entrar") ia se repetir mais
duas vezes (`ProfileMenu`, `MobileNavDrawer`) — extraído para o hook
[`useMountTransition`](../src/hooks/useMountTransition.ts) (`src/hooks/`, primeiro uso desse
diretório no projeto — `Context.md` §16 já previa esse local para hooks compartilhados, distinto
de `src/lib` para utilitários sem estado como `cn.ts`). `Modal` e `Toast` foram migrados para o
mesmo hook, removendo a lógica duplicada.

- `ProfileMenu` (dropdown do perfil, desktop): fade+scale a partir do canto superior direito
  (`origin-top-right`), mesma duração dos overlays (`duration-base`).
- `MobileNavDrawer` (painel do menu hambúrguer, mobile): slide down + fade (`-translate-y-2` →
  `translate-y-0`).
- `MenuIcon`: reescrito de dois `path` alternados por `open` (troca abrupta — o navegador não
  interpola um `d` de path para outro de forma confiável) para três `<line>` fixas sempre no DOM,
  cuja transição hambúrguer↔X é só `transform`/`opacity` (linha do meio some, linhas de cima/baixo
  giram 45°/-45° e deslizam até o centro) — mesmo contrato visual dos outros ícones do app (viewBox
  24×24, `strokeWidth` 1.6).
- Verificação manual: dropdown e drawer abrindo com as classes "ocultas" corretas e desmontando ao
  fechar (clique fora, no caso do `ProfileMenu`; botão de fechar, no `MobileNavDrawer`); ícone
  alternando as classes de transform corretamente entre os dois estados. Screenshot da animação em
  si não foi possível nesta sessão (painel de preview sem compositing — mesma limitação já
  registrada na Etapa 2), verificação feita por inspeção de classes/DOM.

### Etapa 4 — detalhamento

Diferente das etapas anteriores, os itens aqui não precisam do padrão "montado durante a saída"
(`useMountTransition`) — são animações de entrada simples (o elemento nasce e anima uma vez, sem
precisar coordenar desmontagem). Usam `@keyframes` + o namespace `--animate-*` do Tailwind v4
corretamente pela primeira vez no projeto (a Etapa 1 já tinha diagnosticado que os tokens antigos
usavam esse namespace errado para durações — agora ele é usado para o que existe de fato: atalhos
de `animation`):

- `--animate-fade-slide-in` (`globals.css`) — fade + leve slide vertical (4px), `duration-base`.
  Aplicado em:
  - [`Alert.tsx`](../src/components/ui/Alert.tsx) — direto no componente compartilhado, beneficia
    todo alerta condicional já existente (erros de formulário, avisos) sem precisar tocar cada
    call-site.
  - Bloco "Valores estimados" em
    [`BookingRequestForm.tsx`](../src/features/bookings/components/BookingRequestForm.tsx) — só
    quando a prévia de preço aparece pela primeira vez (`quote.isSuccess`); como o `<div>` permanece
    montado entre recálculos (debounce a cada mudança de data/destino), a animação não repete a
    cada recálculo, só na primeira revelação.
  - `PriceBreakdown.tsx` em si **não** ganhou a classe — também é usado em páginas já totalmente
    carregadas (`/reservas/[id]`, `/reservas/recebidas/[id]`), onde animar a cada carregamento de
    página seria decorativo, não funcional (princípio 1 do MOTION.md).
- `--animate-heart-pop` (`globals.css`) — "pop" de escala (1 → 1.25 → 1) em `duration-slow`, no
  [`FavoriteButton.tsx`](../src/features/favorites/components/FavoriteButton.tsx). Só aplicado ao
  favoritar (não ao desfavoritar); removido via `onAnimationEnd` para poder tocar de novo na
  próxima vez (uma classe presente permanentemente não reinicia uma `animation` já concluída). Sem
  caso de borda equivalente ao do Modal/Toast: o keyframe final (`scale: 1`) já é o estado de
  repouso, então mesmo que `animationend` nunca disparasse, não haveria glitch visual — só uma
  classe residual inofensiva.
- `CatalogMachineCard.tsx` — leve `hover:-translate-y-0.5` somado ao `hover:shadow-*` que já
  existia, reforçando a profundidade no hover.
- **Catálogo ao filtrar**: descartado — ver nota na tabela de mapeamento acima.
- Verificação: os dois novos utilitários `animate-*` foram confirmados via
  `getComputedStyle`/`animationName` no navegador; o toggle de favorito foi testado de ponta a
  ponta (login como locatário, favoritar/desfavoritar em `/catalogo`). `animationend` não disparou
  nesta sessão pelo mesmo motivo já registrado (painel sem compositing) — sem risco real, pelo
  argumento do parágrafo anterior.

### Etapa 5 — detalhamento

O bloco "Andamento" (`<ol>` com o histórico de status) estava duplicado, idêntico, em
`/reservas/[id]` e `/reservas/recebidas/[id]`. Extraído para
[`BookingStatusTimeline.tsx`](../src/features/bookings/components/BookingStatusTimeline.tsx) —
resolve a duplicação (`Context.md` §16/§32) e dá um lugar único para a lógica de destaque.

**O problema arquitetural**: as duas páginas são Server Components — cada ação (pagar, avançar
etapa, cancelar, aprovar/recusar) mora num componente cliente à parte
(`FulfillmentActionButton`, `PaymentForm`, `CancelBookingButton`, `BookingDecisionActions`) que já
chamava `router.refresh()` após mutar. Sem nenhum sinal adicional, `BookingStatusTimeline` não tem
como saber se está sendo renderizado porque o usuário acabou de causar uma transição, ou porque só
abriu a reserva para consultar — destacar a última entrada em toda visita seria decorativo, não
funcional (princípio 1).

- [`timeline-highlight.ts`](../src/features/bookings/lib/timeline-highlight.ts): dois helpers de
  `sessionStorage` — `markBookingJustAdvanced(bookingId)`, chamado pelos quatro componentes de ação
  logo antes do `router.refresh()`; `consumeBookingJustAdvanced(bookingId)`, lido (e apagado) uma
  vez pelo `BookingStatusTimeline` para decidir se destaca a última entrada.
- `--animate-status-highlight` (`globals.css`) — um único `@keyframes` cobrindo entrada
  (opacity/translate, como o `fade-slide-in`) **e** um fundo destacado que sustenta e esmaece
  (`var(--color-primary-100)` → transparente). Duas classes `animate-*` na mesma tag não compõem
  (a segunda simplesmente substitui a `animation` da primeira), por isso os dois efeitos precisam
  estar no mesmo keyframe. Nova exceção documentada à escala de duração: `--duration-highlight`
  (1200ms) — não é uma transição de interface, é um aceno de atenção que precisa durar o
  suficiente para ser notado antes de desaparecer.
- **Caso de borda real encontrado e corrigido durante a verificação**: a primeira versão usava
  `useEffect(() => {...}, [])` ("rodar só na montagem"), mas `router.refresh()` **não desmonta**
  `BookingStatusTimeline` — só entrega `statusHistory` atualizado via props no componente já
  montado. Resultado: o efeito nunca rodava de novo após o refresh, a marca ficava presa no
  `sessionStorage` e nada era destacado. Corrigido trocando a dependência para
  `[statusHistory.length, bookingId]` — o crescimento da lista, não a montagem, é o sinal certo de
  "há uma transição nova para conferir".
- Verificação de ponta a ponta no navegador: login como locatário, reserva instantânea criada,
  pagamento confirmado — a entrada "Pagamento confirmado" recebeu `animate-status-highlight` no
  primeiro carregamento após a ação, e nenhuma entrada foi destacada numa segunda visita à mesma
  reserva sem nenhuma ação nova (a marca é consumida uma única vez). `sessionStorage` inspecionado
  diretamente para confirmar a marca sendo escrita e depois removida.

## Revisão geral (pós-Etapa 5)

Reportado que "algumas animações estavam quebrando" — revisão de todos os arquivos das Etapas 1–5
em busca de bugs reais, não só releitura do que já tinha sido verificado.

### Bug encontrado e corrigido: `useMountTransition` travava ao reabrir rápido demais

O bug mais sério, afetando os quatro consumidores do hook (`Modal`/`ConfirmationDialog`,
`ProfileMenu`, `MobileNavDrawer` — `Toast` não é afetado, ver abaixo): a versão original tinha
**dois** `useEffect` — um reagindo a `open` (decide `rendered`/inicia a saída), outro reagindo a
`rendered` (dispara o frame de entrada via `requestAnimationFrame`). Se o usuário fechasse e
reabrisse antes da transição de saída terminar (ex.: duplo clique no botão do menu, ou
cancelar-e-reabrir um `ConfirmationDialog` rapidamente), `rendered` permanecia `true` o tempo
todo — nunca virava `false` e voltava a `true` — então o efeito que dispara a entrada (dependente
de `[rendered]`) **nunca rodava de novo**. Resultado: o elemento ficava montado (`rendered: true`)
mas preso em `opacity-0`/`scale-95` (`visible: false`) para sempre — o menu/modal/drawer parecia
simplesmente não abrir mais, até a página ser recarregada.

Corrigido consolidando tudo num único `useEffect`, sempre reagindo só a `open`: toda vez que
`open` vira `true` — inclusive reabrindo em cima de uma saída ainda em andamento — o efeito
reagenda um novo frame de entrada. Ver comentário em
[`useMountTransition.ts`](../src/hooks/useMountTransition.ts).

**Como foi confirmado** (sem depender de screenshot, indisponível nesta sessão — painel sem
compositing): como a aba oculta também bloqueia `requestAnimationFrame` de rodar de verdade (razão
pela qual as etapas anteriores só puderam confirmar por inspeção de classes, nunca o frame de
entrada completando), a reprodução exigiu substituir temporariamente `window.requestAnimationFrame`
por uma versão baseada em `setTimeout` (que roda mesmo com a aba oculta), só para o teste. Com
isso: abri o `ProfileMenu`/`Modal`/`MobileNavDrawer` de verdade (confirmando `scale-100
opacity-100` via `getComputedStyle`/className), fechei, e — **antes** de qualquer espera —
reabri. Na versão com bug esse passo travaria em `scale-95 opacity-0`; com a correção, os três
voltam a `scale-100 opacity-100`/`opacity-100 translate-y-0` corretamente. `npm run typecheck`,
`npm run lint` e `npm run test` (121 testes) seguem passando.

### Por que `Toast` não tem esse bug

`Toast` usa `useMountTransition(!leaving)`, mas `leaving` só vai de `false` para `true` uma única
vez por instância (`ToastProvider` nunca reverte `leaving` para `false` de um toast já existente)
— não há como reabrir uma saída em andamento, então a classe de bug acima não se aplica.

### Bug encontrado e corrigido (2ª rodada, a partir de captura de tela real): `MenuIcon` girava em torno do ponto errado

Reportado com uma captura de tela real do menu mobile aberto: o botão não mostrava um X, e sim um
traço diagonal solto, torto. A causa: para elementos SVG, `transform-box` tem como padrão
`view-box` — ou seja, `transform-origin: 50% 50%` (o padrão do CSS) resolve em relação ao viewBox
inteiro, não ao centro de cada `<line>`. Confirmado nesta engine que o pivô resultante cai no canto
(0,0) do viewBox, não no seu centro. Rotacionar as linhas de cima/baixo 45°/-45° em torno de (0,0)
em vez do próprio centro faz cada uma girar para uma posição bem diferente da esperada — a linha de
baixo, em particular, gira quase inteiramente para fora da viewBox (por isso o usuário via só um
traço, não duas linhas cruzadas).

Confirmado por dois caminhos:
1. `getComputedStyle` num `<line>` isolado mostrou `transformOrigin: "0px 0px"` com o padrão do
   navegador.
2. Cálculo manual da rotação de cada linha ao redor de (0,0) reproduz exatamente o formato visto na
   captura de tela (uma linha parcialmente visível, a outra praticamente fora do viewBox).

Corrigido adicionando `[transform-box:fill-box] origin-center` nas duas linhas que giram — isso
faz `transform-origin` resolver em relação à própria caixa delimitadora de cada linha, não ao
viewBox inteiro. Confirmado via `getBoundingClientRect`: aplicando as classes do estado "aberto" já
na criação (contornando a limitação de transições não rodarem nesta aba oculta, abaixo), as duas
linhas rotacionadas passam a ocupar exatamente a mesma caixa delimitadora — ou seja, se encontram
no centro formando um X de verdade. Ver comentário em
[`MenuIcon.tsx`](../src/components/ui/MenuIcon.tsx).

### Pista falsa descartada: "transições dinâmicas de `rotate`/`translate` nunca terminam"

Durante a investigação acima, alternar `rotate`/`translate` dinamicamente (elemento já montado,
depois muda a classe) parecia nunca completar nesta sessão — permanecia preso no valor inicial
mesmo bem depois da duração da transição. Investigação mais funda mostrou que isso **não é
específico de SVG nem de `rotate`/`translate`**: o mesmo aconteceu com `opacity` simples num
`<div>` comum. Causa real: o painel de preview desta sessão não composita frames
(`document.hidden === true`, mesma limitação já registrada nas Etapas 2–4 para
`requestAnimationFrame`/`animationend`) — parece que isso também congela transições CSS já em
andamento, não só animações. Um valor aplicado **na criação** do elemento (sem transição em
andamento) sempre funcionou; só a transição *dinâmica* travava. Como isso não tem relação com o bug
real (que é de geometria/origem, não de timing), e não deve ocorrer numa aba visível de verdade,
não gerou nenhuma mudança de código — só invalidou uma hipótese errada no meio do caminho.

### Outros pontos revisados, sem bug confirmado

- **`transition-transform` no `MenuIcon`**: suspeita inicial de que não cobriria as propriedades
  modernas `translate`/`rotate` (usadas nas classes condicionais). Verificado via
  `getComputedStyle` no navegador: o Tailwind v4 gera `transition-property: transform, translate,
  scale, rotate` para o utilitário `transition-transform` — cobre as quatro. Não era bug.
- **`scale-*`/`translate-*` do Tailwind**: confirmado via `getComputedStyle` que geram as
  propriedades nativas `scale`/`translate` (não `transform: scale(...)`), validando que
  `transition-[opacity,scale]`/`transition-[opacity,translate]` (Modal, Toast, ProfileMenu,
  MobileNavDrawer, CatalogMachineCard) observam as propriedades certas.
- **`animate-heart-pop` (`FavoriteButton`) não reproduz se o usuário alternar favorito/desfavoritar
  muito rápido** (a classe já está aplicada quando `setJustFavorited(true)` é chamado de novo — uma
  `animation` já concluída não reinicia só porque a mesma classe foi reaplicada). Não corrigido:
  diferente do bug do `useMountTransition`, aqui o keyframe final (`scale: 1`) é idêntico ao estado
  de repouso, então o pior caso é "a animação não toca de novo", nunca um elemento visualmente
  quebrado ou preso.

## Etapa 6 — feedback de clique + skeleton de página

Dois problemas de feedback separados, cada um com a solução mais adequada ao caso (não o mesmo
mecanismo para os dois):

### Feedback de clique (pressão instantânea)

`Button`, `IconButton`, o gatilho do `ProfileMenu` e o gatilho do `MobileNavDrawer` ganharam
`active:scale-[0.97]` — um retorno tátil instantâneo ao pressionar, independente de qualquer
requisição estar pendente. Isso é complementar ao `isLoading`/`Spinner` que essas ações já tinham
(que só aparece depois que uma mutação começa) — o `active:scale` cobre o instante entre o clique e
qualquer resposta do servidor, que antes não tinha feedback nenhum.

Como `transition-property` é uma única propriedade CSS (mesmo problema já visto com `animation` —
duas classes `transition-*` na mesma tag não compõem, a última vence), as classes de cor existentes
(`transition-colors`) viraram `transition-[background-color,border-color,color,scale]` explícito,
cobrindo cor e escala na mesma declaração.

`FavoriteButton` não recebeu esse tratamento de propósito — já tem o `animate-heart-pop` dedicado
ao favoritar (Etapa 4), e sobrepor um segundo controle de `scale` ali competiria com esse.

### Skeleton de página (`loading.tsx`)

Novo componente [`Skeleton.tsx`](../src/components/ui/Skeleton.tsx) (`Context.md` §12.2, primeiro
componente do design system a nascer via esta etapa de motion) — bloco cinza com `animate-pulse`
(utilitário nativo do Tailwind, já respeitando `prefers-reduced-motion` pela regra global).

Aplicado via `loading.tsx` do Next.js App Router — arquivo que o Next mostra automaticamente
durante a navegação para aquela rota enquanto os dados carregam no servidor, sem nenhuma lógica de
cliente:

- `src/app/catalogo/loading.tsx` e `src/app/catalogo/[slug]/loading.tsx` — formato aproximado da
  grade de cards e da página de detalhe.
- `src/app/(app)/reservas/loading.tsx` e `.../reservas/recebidas/loading.tsx` — mesmo formato de
  lista (`BookingListCard`/`OwnerBookingListCard` têm o mesmo layout), por isso reaproveitam um
  único [`BookingListSkeleton.tsx`](../src/features/bookings/components/BookingListSkeleton.tsx).
- `src/app/(app)/reservas/[id]/loading.tsx` e `.../reservas/recebidas/[id]/loading.tsx` — mesma
  lógica, reaproveitando
  [`BookingDetailSkeleton.tsx`](../src/features/bookings/components/BookingDetailSkeleton.tsx).

Cada skeleton fica dentro de um container com `role="status"`/`aria-label` e um texto
`sr-only` (`Context.md` §13: estado de carregamento anunciável a leitor de tela) — os blocos
cinzas em si são `aria-hidden`, só decoram visualmente.

**Escopo**: só as páginas que buscam dado no servidor antes de renderizar e que já existiam antes
desta etapa (catálogo, detalhe da máquina, as duas listas e os dois detalhes de reserva) — não
`/propriedades`, `/maquinas`, `/favoritos`, etc., para não expandir o escopo além do que foi
pedido. O mesmo padrão (`Skeleton` + `loading.tsx`) se estende a qualquer rota nova que precisar.

Verificação: `npm run typecheck`, `npm run lint` e `npm run test` (121 testes) passam; navegação
manual por catálogo, detalhe da máquina, `/reservas`, `/reservas/[id]` e `/reservas/recebidas`
confirmada sem erros de console em uma aba nova (uma aba antiga desta sessão, com muitas trocas de
HMR acumuladas ao longo da conversa, mostrou erros de "hooks changed size" que não se repetem numa
aba/carregamento frescos — artefato do ambiente de desenvolvimento, não bug de código).
