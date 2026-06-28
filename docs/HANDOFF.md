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
4. `pnpm db:seed` (idempotente) · `pnpm test` · `pnpm build`.

### Credenciais de dev (seed)
- `prof@vip.dev` (profissional) e `aluno@vip.dev` (aluno), gym `gym-demo`,
  senha **`treino123`**. Só dev.

---

## Próxima etapa — Fase 2 (Atribuições) e dívidas da Fase 1

Front segue congelado salvo o necessário para validar o backend. Ordem sugerida;
leitura de segurança ao fim. Cada item é uma fatia commitável.

### A. Migração aditiva `Assignment` + vínculo de leitura por papel
- Modelo `Assignment` (profissional atribui plano a aluno com vínculo ativo —
  RN-ATR), com índice parcial "1 atribuição ativa por par" e CHECKs.
- **`listWorkoutPlans` hoje é escopado só por `gymId`** (todo mundo do gym vê os
  planos do gym). Trocar para escopo por PAPEL: profissional vê os planos que
  criou; aluno vê os planos ATRIBUÍDOS a ele (via `Assignment`). Estender
  `assertCan` para `assignment:*` e leitura de aluno.

### B. Edição/soft-delete de plano + UI de criação (descongelar o mínimo)
- Server Actions `updateWorkoutPlan`/`deleteWorkoutPlan` (assertCan read/update/
  delete já cobre posse+tenant). Formulário de criação ligado a
  `createWorkoutPlanAction`.

### C. Dívidas conscientes da Fase 1 a fechar
- Fluxo de **reset de senha manual** (usa `mustChangePassword`) + troca de senha
  (RN-CFG-02) com `passwordSchema`.
- ESLint + **CI** (rodar `pnpm test` e `pnpm build`; resolver engines do Prisma no
  CI — ver Ambiente). `/configuracoes` ainda client+mock. Branding (nome do app).
- `callbackUrl` do login não está sendo respeitado (cai sempre em `/`) — ajustar.

---

## Pendências / dívidas conscientes
- **Drift do Prisma:** o SQL bruto (índice parcial de CREF, CHECKs) não está no
  `schema.prisma`; futuros `migrate dev` podem acusar drift — manter os blocos nas
  migrações e não deixar o Prisma removê-los.
- Migrações aditivas das fases seguintes: `Assignment` (F2), `Link` (F3),
  `WorkoutLog`/`ExerciseLog` (F3), `Profile` (F4) — com seus índices parciais
  (1 atribuição ativa/par; 1 profissional ativo/aluno por gym) e CHECKs.
- Engines do Prisma em CI/produção (ver Ambiente). `generate` é offline (Rust-free);
  só o schema-engine é necessário, via `PRISMA_SCHEMA_ENGINE_BINARY`.
- Fase 0 inacabada: ESLint/CI, `/configuracoes`, branding. (Vitest ✅ na Fase 1.)
- **Escopo de leitura por papel** ainda pendente: `listWorkoutPlans` filtra só por
  `gymId` (ver Próxima etapa A) — aluno/profissional ainda não veem recortes
  distintos até `Assignment`.
- RLS no Postgres (defesa em profundidade do tenant) — avaliar antes do 1º deploy real.
- `AUTH_SECRET` em produção precisa ser um segredo forte (o `.env` de dev usa
  placeholder); `trustHost: true` está ligado (ok para self-host).
