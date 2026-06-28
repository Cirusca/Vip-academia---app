# Handoff — `[NOME_DO_APP]` (app de treino B2B2C)

> **Data:** 28/06/2026 · **Branch:** `claude/requirements-report-plan-bz1qad`  
> Documento de continuidade: estado atual, particularidades do ambiente e plano
> da próxima etapa. Hub dos demais docs em `docs/`.

## Princípios permanentes (não negociáveis)

1. **Nada do backend fica no front.** Segredos, lógica e acesso a dados ficam
   server-only (`lib/data/*` com `import "server-only"`, Server Components,
   `select` sem `passwordHash`). O front só recebe view-data por props.
2. **Leitura de segurança ao fim de cada fase.**
3. **Front congelado** até o backend estar validado (decisão do usuário).
4. Desenvolver/commitar/push **sempre** na branch `claude/requirements-report-plan-bz1qad`.
5. Multi-tenant: `gymId` **sempre** derivado da sessão, nunca do cliente.

---

## Estado atual

### Documentação (completa e revisada por agentes)
- `RELATORIO_DE_REQUISITOS.md` (v2.1) · `PLANO_DE_IMPLEMENTACAO.md` (v2.2) ·
  `REGRAS_DE_NEGOCIO.md` (v1.1) · `REVISAO_VALIDACAO.md` ·
  `REVISAO_PLANO_E_SEGURANCA.md` (adversarial por fase + bootstrap + segurança).
- Escopo: MVP B2B2C, profissional atribui → aluno executa, academias low-mid.
- Decisões fechadas: **Prisma + PostgreSQL (Neon)**, **Auth.js v5**, **PWA sem
  service worker** (manifest installable), **reset de senha manual**, nome a definir.

### Fase 0 — Fundação (✅ feito)
- next-pwa removido; `images.unoptimized`/`ignoreBuildErrors` removidos (build honesto).
- Poda: `app/agenda`, `app/personal`, `components/personal` deletados; menu limpo.
- `ThemeProvider` montado.
- **Fachada `lib/data/*` server-only** aplicada em `/treinos` e no dashboard
  (`app/page.tsx` + 4 componentes consomem via fachada; nenhum client importa `lib/data`).
- `.gitignore` cobre `.env`; `.env.example` só com vars server-only.
- **Pendente da Fase 0:** ESLint + Vitest + CI; `/configuracoes` ainda client+mock
  (abas admin a podar); branding (nome).

### Fase 1 — Backend, fatia de dados (🚧 em curso)
- **Schema Prisma 7.8** (`prisma/schema.prisma`) projetado/validado por workflow
  subagent-driven; 3 bloqueadores do Prisma 7 corrigidos (datasource sem url →
  `prisma.config.ts`; sem `previewFeatures`; `Account` com `@@unique`).
- **Migração `init_auth_and_core` aplicada em Postgres real** (Auth.js + User +
  WorkoutPlan + Exercise). Regras impostas no banco e **testadas**: índice único
  parcial de CREF (profissional ativo/gym), `CHECK sets>=1`, `CHECK order>=1`.
- **Falta nesta fase:** `prisma generate`; `lib/prisma.ts`; validadores zod;
  camada de acesso segura (gymId/assertCan); Auth.js; seed; 1ª fatia vertical
  (criar WorkoutPlan persistido via Server Action autorizada).

---

## Ambiente (CRÍTICO para retomar)

### Postgres local de dev
- Postgres 16 roda no container: `service postgresql start`.
- DB/role: `vip_dev` / role `vip` (senha `vip`, com `CREATEDB` para shadow db).
- `.env` (gitignored, **não commitar**) já aponta para ele:
  `DATABASE_URL` e `DIRECT_URL` = `postgresql://vip:vip@127.0.0.1:5432/vip_dev?schema=public`.

### Prisma engines NÃO baixam pelo downloader do Node (proxy reseta — ECONNRESET)
`curl` ao host `binaries.prisma.sh` funciona com o CA bundle; o downloader do Node não.
**Workaround usado** (baixar engine via curl e apontar o Prisma para ele):
```bash
COMMIT=3c6e192761c0362d496ed980de936e2f3cebcd3a   # require('@prisma/engines-version').enginesVersion
PLAT=debian-openssl-3.0.x
CACHE="/root/.cache/prisma/master/$COMMIT/$PLAT"
curl -sS --cacert /root/.ccr/ca-bundle.crt -o /tmp/schema-engine.gz \
  "https://binaries.prisma.sh/all_commits/$COMMIT/$PLAT/schema-engine.gz"
gunzip -f /tmp/schema-engine.gz && chmod +x /tmp/schema-engine && cp /tmp/schema-engine "$CACHE/schema-engine"
```
**Para QUALQUER comando Prisma**, exportar:
```bash
export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
export PRISMA_SCHEMA_ENGINE_BINARY="$CACHE/schema-engine"
```
> Para `prisma generate` será preciso o **query engine** (e/ou query-compiler do
> Prisma 7) pelo mesmo método curl — ver passo 1 do plano abaixo. Em CI/produção,
> resolver via mesmo workaround, mirror (`PRISMA_ENGINES_MIRROR`) ou imagem com engines.

---

## Plano da próxima etapa (backend, sem tocar no front)

Ordem recomendada; leitura de segurança ao fim. Cada item é uma fatia commitável.

### 1. `prisma generate` + cliente
- Baixar via curl o(s) engine(s) que `generate` exigir (query-engine/libquery e/ou
  query-compiler) para o cache, como o schema-engine.
- Rodar `pnpm exec prisma generate` → cliente em `lib/generated/prisma` (gitignored).
- Adicionar **postinstall** `prisma generate` no `package.json` (regenera após install).
- Criar `lib/prisma.ts`: singleton do `PrismaClient` com **adapter**
  (`@prisma/adapter-neon` em prod; `@prisma/adapter-pg` para o Postgres local de dev).
  Instalar `@prisma/adapter-neon @neondatabase/serverless` (prod) e p/ dev `@prisma/adapter-pg pg`.

### 2. Camada de acesso segura (a tríade em CÓDIGO) — o item mais importante
- `lib/auth/session.ts`: helper que lê a sessão (placeholder até Auth.js) e expõe
  `requireSession()` → `{ userId, gymId, roles }`. **`gymId` nunca vem do cliente.**
- `lib/data/_scope.ts`: helper central que injeta `where: { gymId }` obrigatório;
  nenhum acesso a `prisma` cru fora de `lib/data/*`.
- `lib/auth/assertCan.ts`: `assertCan(session, action, resource)` (papel + posse +
  vínculo); falha → 404 (anti-IDOR), nunca 403.
- Regra: toda leitura que cruza para o cliente usa `select` explícito **sem
  `passwordHash`**.

### 3. Validadores zod das regras de negócio (`lib/validation/*`)
- `RN-USR-04` senha (≥8, letra+número); `RN-USR-05` formato CREF (UF+número);
  `RN-PLA-03` plano com nome + ≥1 exercício; `RN-PLA-04`/`RN-LIM-01` faixas e
  quotas (≤30 ex/plano, ≤50 planos/prof — contagem escopada por gymId, ignorando
  inativos); `RN-INV-02` data não-futura no fuso `America/Sao_Paulo`.
- Reutilizáveis no servidor (validação client é só UX).

### 4. Auth.js v5
- `auth.ts` (NextAuth, **`session.strategy: "jwt"`**, Credentials + `bcryptjs`),
  `roles`/`gymId` no token; `app/api/auth/[...nextauth]/route.ts`; **`proxy.ts`**
  (Next 16 renomeou `middleware.ts`) protegendo rotas.
- Ligar logout (`signOut`) ao botão Sair da sidebar.
- Instalar `next-auth@beta @auth/prisma-adapter bcryptjs @types/bcryptjs`.

### 5. Seed + 1ª fatia vertical fim-a-fim
- `prisma/seed.ts` (`tsx`): 1 profissional + 1 aluno (mesmo `gymId`, hash bcrypt),
  alguns `WorkoutPlan`/`Exercise`. `package.json` `prisma.seed`.
- Server Action `createWorkoutPlan`: `requireSession()` → `assertCan` → `zod.parse`
  → cria escopado por `gymId`/`createdBy`. Trocar `lib/data/getWorkoutPlans()` de
  mock para Prisma (filtrando `gymId`).
- **Aceite (inegociável):** teste negativo de autorização — aluno ou outro `gymId`
  **não** cria/lê o plano (404 no servidor).

### 6. Testes + leitura de segurança da fase
- Vitest: unit dos validadores zod + do helper de escopo; 1 teste de integração
  do fluxo "criar plano" com o teste negativo de tenant/RBAC.
- Fechar com leitura de segurança (gymId, IDOR, passwordHash, segredos).

---

## Pendências / dívidas conscientes
- **Drift do Prisma:** o SQL bruto (índice parcial de CREF, CHECKs) não está no
  `schema.prisma`; futuros `migrate dev` podem acusar drift — manter os blocos nas
  migrações e não deixar o Prisma removê-los.
- Migrações aditivas das fases seguintes: `Assignment` (F2), `Link` (F3),
  `WorkoutLog`/`ExerciseLog` (F3), `Profile` (F4) — com seus índices parciais
  (1 atribuição ativa/par; 1 profissional ativo/aluno por gym) e CHECKs.
- Engines do Prisma em CI/produção (ver Ambiente).
- Fase 0 inacabada: ESLint/Vitest/CI, `/configuracoes`, branding.
- RLS no Postgres (defesa em profundidade do tenant) — avaliar antes do 1º deploy real.
