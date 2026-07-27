# Arquitetura — Arvum

## Visão geral

Aplicação full-stack única em Next.js (App Router): o próprio Next cobre frontend e backend via
Route Handlers, evitando manter dois serviços separados para um projeto de 2 pessoas.

```
src/
  app/                     # rotas (App Router) — casca fina, sem regra de negócio
    (auth)/login, (auth)/cadastro
    (app)/propriedades, (app)/perfil, (app)/maquinas
    catalogo/, catalogo/[slug]/          # público, fora do (app)
    api/auth/[...nextauth]/route.ts
    api/v1/properties/route.ts, [id]/route.ts
    api/v1/categories/route.ts
    api/v1/machines/route.ts, [id]/route.ts, [id]/status,
      [id]/images(+[imageId]), [id]/availability(+[blockId])
  auth.ts                  # configuração raiz do Auth.js
  middleware.ts            # proteção de rota
  components/
    ui/                    # design system (Button, Input, Textarea, Select, Label, FormField, Card, Alert, Badge, Spinner, EmptyState)
    shared/                # Providers, AppHeader, AppNav, PublicHeader, Footer, Logo
  features/
    authentication/        # schemas, actions, lib/password.ts, components
    users/
    properties/            # schemas, services, hooks, components
    categories/             # services (leitura), types
    machines/               # schemas, lib (slug, status), services, hooks, components
  lib/                     # prisma, env, api-response, session, cn
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
3. **Descoberta** — busca avançada, filtros completos, favoritos, localização/distância real.
4. **Transação** — reservas, cálculo de valores, logística, pagamento simulado, histórico de status.
5. **Confiança** — avaliações, notificações, mensagens, moderação.
6. **Administração e qualidade** — painel admin, indicadores, testes, acessibilidade, segurança, documentação, deploy.

Adaptadores simulados (mapas/geolocalização, pagamento, transportadoras) serão introduzidos nas
fases 2–4 atrás de interfaces de serviço, permitindo substituição futura por provedores reais sem
reescrever regras de negócio.
