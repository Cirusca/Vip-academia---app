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

### Fase 1 — Backend, fatia de dados (✅ feito + validado fim-a-fim)
- **Schema Prisma 7.8** + migração `init_auth_and_core` aplicada em Postgres real
  (Auth.js + User + WorkoutPlan + Exercise); CHECKs e índice parcial de CREF
  impostos e testados no banco.
- **`prisma generate`** (cliente em `lib/generated/prisma`, gitignored) +
  **`lib/prisma.ts`** (singleton server-only, adapter por URL: PrismaNeon em prod
  `neon.tech`, PrismaPg no Postgres local). `postinstall` regenera o cliente.
- **Tríade de acesso seguro (item mais crítico):** `lib/auth/errors.ts` (404
  anti-IDOR), `lib/auth/session.ts` (`requireSession` lê de `auth()`; `gymId`/
  `roles` do TOKEN), `lib/auth/assertCan.ts` (RBAC+tenant+posse, falha→404),
  `lib/data/_scope.ts` (`tenantWhere` injeta `gymId` não sobrescrevível; ponto
  único de acesso ao prisma).
- **Validadores zod** (`lib/validation/*`): senha, CREF, plano/exercício, data
  não-futura (America/Sao_Paulo), limites RN-LIM-01.
- **Auth.js v5** (Credentials+jwt+bcryptjs; `auth.config.ts` edge-safe + `auth.ts`
  Node com PrismaAdapter; `proxy.ts` Next 16; route handler; **`trustHost`** p/
  self-host). Login mínimo (`/login`) + `signOut` no botão Sair. Hardening
  anti-enumeração (bcrypt.compare constante).
- **Seed** idempotente (`prisma/seed.ts`, `db:seed`) + **1ª fatia vertical**:
  `lib/data/workouts.ts` consulta o Prisma escopado por `gymId`;
  `getWorkoutPlanById` com anti-IDOR; Server Action `createWorkoutPlanAction`
  (requireSession→assertCan→zod→escrita escopada).
- **Testes:** Vitest (39) — validadores, escopo, assertCan e **integração**
  (cross-tenant não lista/lê → 404; aluno não lê → 404; create ignora gymId do
  input). **Validado em runtime:** deslogado→/login (307); login do seed retorna
  sessão com `gymId`/`roles`; `/treinos` autenticado renderiza o plano.
- Leitura de segurança da fase: ✅ (gymId, IDOR, passwordHash não exposto,
  segredos fora do git, sem prisma cru fora de `lib/data`).

### Fase 2 — fatia A: Atribuições + escopo por papel (✅ feito + validado)
- **Migração aditiva `add_assignments`** (escrita à mão, aplicada por
  `migrate deploy` p/ não autogerar e preservar o SQL bruto da Fase 1): model
  `Assignment` + enum `AssignmentStatus(ativa|pausada|concluida)` + FKs +
  **índice parcial único `assignments_active_pair_unique`** (RN-ATR-08 — 1 ativa
  por par). Verificado no banco; CREF/CHECKs da Fase 1 intactos (sem drift).
- **`lib/data/assignments.ts`** (server-only): `assignPlanToAluno` (posse do
  plano via `assertCan`; aluno-alvo re-buscado escopado por gym; **idempotente**
  com guarda `P2002`) e `revokeAssignment` (pausa; só quem atribuiu).
- **Escopo por PAPEL** (RN-ATR-04): `listWorkoutPlans` ramifica — profissional vê
  o que criou; aluno vê só os planos com `Assignment` ativa p/ ele.
  `getWorkoutPlanById` libera o aluno via `viewerHasActiveAssignment`.
- **`assertCan` estendida**: `read` separado de `update`/`delete`; ações
  `assignment:create`/`assignment:revoke`; mantém-se pura (a flag de atribuição
  é resolvida na camada de dados). Server Actions `assignPlanAction`/
  `revokeAssignmentAction`.
- **Seed** atribui o plano demo ao aluno (idempotente). **Testes: 59** (eram 39)
  — +integração do ciclo de atribuição (cross-tenant/posse/idempotência/revogar)
  e +unit de `assertCan`. `pnpm build` ✅ (TS ok; fronteira server-only intacta).
- **Leitura de segurança Fase 2 ✅:** `gymId` sempre da sessão; `alunoId`/
  `workoutPlanId` do input só são aceitos após re-busca escopada por gym (IDOR →
  404); RBAC por `assertCan` (atribuir = profissional dono; revogar = quem
  atribuiu; aluno lê só atribuído ativo); idempotência sem duplicar ativa
  (índice parcial + P2002); nenhum segredo/coluna sensível exposto; `assignments.ts`
  é `server-only`. **Dívida consciente:** o gate de *vínculo ativo* (RN-ATR-02/
  RN-VIN-06) só entra com `Link` na Fase 3 — hoje qualquer aluno do mesmo gym pode
  receber atribuição.

### Fase 2 — fatia B: updateWorkoutPlan + deleteWorkoutPlan + CI (✅ feito + validado)
- **Zod schemas** `updateWorkoutPlanSchema`/`deleteWorkoutPlanSchema` em
  `lib/validation/workoutPlan.ts` (exercícios opcionais; campos anuláveis typed
  com `.nullable()`).
- **`updateWorkoutPlan`** (server-only): re-busca por `tenantWhere` (gymId da
  sessão) + `status=ativo` antes de gravar; `assertCan("workoutPlan:update")`
  com gymId+createdBy; substituição atômica de exercícios (`deleteMany + create`)
  quando `input.exercises` presente; `order` 1-based re-atribuído pelo servidor.
- **`deleteWorkoutPlan`** (server-only, soft-delete): mesmo padrão de re-busca +
  `assertCan("workoutPlan:delete")`; `$transaction` atômico: pausa `Assignments`
  ativas (`status → pausada`) + `WorkoutPlan` → `status=inativo, deletedAt=now()`.
  Plano já inativo → `NotFoundError` (filtra `status=ativo`).
- **Server Actions** `updateWorkoutPlanAction`/`deleteWorkoutPlanAction` em
  `app/actions/workoutPlans.ts`: seguem o padrão `requireSession → zod.parse →
  fachada → revalidatePath("/treinos")`. _Observação: não têm early-gate
  `assertCan` (a fachada cobre; aluno ainda executa 1 query antes de ser
  rejeitado — melhoria de defesa-em-profundidade para versão futura)._
- **Testes: 68** (eram 59): +9 de integração (update: nome, exercícios, no-op,
  IDOR, aluno; delete: IDOR, aluno, soft-delete+cascade, já-inativo).
  TDD red→green verificado (TypeError antes da impl; 68/68 após).
- **CI: `.github/workflows/ci.yml`** — PostgreSQL 16 service container;
  `pnpm install → prisma generate → prisma migrate deploy → pnpm test →
  tsc --noEmit → pnpm build`. Branches `main` e `claude/**`.
- **Leitura de segurança Fase 2B ✅:** `gymId` da sessão em toda query;
  anti-IDOR via `tenantWhere + NotFoundError`; `assertCan` cobre posse+tenant
  para update/delete; `$transaction` garante atomicidade do cascade; `planViewSelect`
  explícito (sem colunas internas); `server-only` intacto (build falha se front
  importar). Dívida mínima: early-gate de papel nas actions de update/delete
  (não é vulnerabilidade — fachada rejeita).

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
> **`prisma generate` (Prisma 7, generator `prisma-client`) NÃO precisa de query
> engine** (é Rust-free). Só usa o **schema-engine** — o mesmo do `migrate`.
> Basta apontar `PRISMA_SCHEMA_ENGINE_BINARY` para o cache (acima) que `generate`
> roda offline. Em CI/produção: mesmo workaround, mirror (`PRISMA_ENGINES_MIRROR`)
> ou imagem com engines.

### Retomar o ambiente (checklist efêmero)
1. `service postgresql start` (role `vip`/db `vip_dev` persistem em `/var/lib`).
2. `export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` e
   `export PRISMA_SCHEMA_ENGINE_BINARY="$CACHE/schema-engine"` (re-baixar via curl
   se o cache sumir).
3. `pnpm install` (o `postinstall` roda `prisma generate`).
4. `pnpm exec prisma migrate deploy` (aplica migrações pendentes **sem** autogerar
   — preserva o SQL bruto; nunca usar `migrate dev` aqui — ver §Drift).
5. Seed: `export CHECKPOINT_DISABLE=1` e `pnpm exec tsx prisma/seed.ts`
   (o CLI `prisma db seed` tenta uma checagem de rede que o proxy reseta —
   ECONNRESET; o `tsx` direto roda offline). Depois `pnpm test` · `pnpm build`.

### Credenciais de dev (seed)
- `prof@vip.dev` (profissional) e `aluno@vip.dev` (aluno), gym `gym-demo`,
  senha **`treino123`**. Só dev.

---

## Próxima etapa — Fase 2 (Atribuições) e dívidas da Fase 1

Front segue congelado salvo o necessário para validar o backend. Ordem sugerida;
leitura de segurança ao fim. Cada item é uma fatia commitável.

### A. Migração aditiva `Assignment` + leitura por papel — ✅ CONCLUÍDO
Feito e validado (ver §"Fase 2 — fatia A" acima). `Assignment` + índice parcial
único, fachada `assignments.ts`, escopo por papel em `listWorkoutPlans`/
`getWorkoutPlanById`, `assertCan` estendida, seed + 59 testes + build.
**Resta como dívida de F3:** gate de *vínculo ativo* (RN-ATR-02/07) com `Link`.

### B. Edição/soft-delete de plano + CI — ✅ CONCLUÍDO (Fase 2B)
Feito e validado (ver §"Fase 2 — fatia B" acima). `updateWorkoutPlan` +
`deleteWorkoutPlan` (soft-delete + cascade), Server Actions, 68 testes,
CI `.github/workflows/ci.yml`, leitura de segurança.

### C. Dívidas conscientes da Fase 1 a fechar (Fase 2C)
- Fluxo de **reset de senha manual** (usa `mustChangePassword`) + troca de senha
  (RN-CFG-02) com `passwordSchema`.
- ESLint. `/configuracoes` ainda client+mock. Branding (nome do app).
- `callbackUrl` do login não está sendo respeitado (cai sempre em `/`) — ajustar.

---

## Pendências / dívidas conscientes
- **Drift do Prisma:** o SQL bruto (índice parcial de CREF/atribuição, CHECKs) não
  está no `schema.prisma`; **nunca usar `migrate dev`** (autogera e tentaria dropar
  esses objetos). Migrações são escritas à mão e aplicadas por `migrate deploy`.
  Já são 2 migrações (`init_auth_and_core` + `add_assignments`); ambas verificadas
  no banco sem drift.
- Migrações aditivas das fases seguintes: `Link` (F3), `WorkoutLog`/`ExerciseLog`
  (F3), `Profile` (F4) — com seus índices parciais (1 profissional ativo/aluno por
  gym) e CHECKs. (`Assignment` ✅ feito na F2.)
- Engines do Prisma em CI/produção (ver Ambiente). `generate` é offline (Rust-free);
  só o schema-engine é necessário, via `PRISMA_SCHEMA_ENGINE_BINARY`.
- Fase 0 inacabada: ESLint, `/configuracoes`, branding. (Vitest ✅ F1; CI ✅ F2B.)
- **Gate de vínculo ativo (RN-ATR-02/07):** atribuir/pausar ainda não checa um
  `Link` ativo prof↔aluno (não existe até a F3). Hoje qualquer aluno do mesmo gym
  pode receber atribuição; encerrar vínculo ainda não pausa atribuições em cascata.
- RLS no Postgres (defesa em profundidade do tenant) — avaliar antes do 1º deploy real.
- `AUTH_SECRET` em produção precisa ser um segredo forte (o `.env` de dev usa
  placeholder); `trustHost: true` está ligado (ok para self-host).
