# Plano de Implementação — `[NOME_DO_APP]` (App de Treino)

> **Versão:** 2.1 (incorpora achados de validação/revisão adversarial — ver [`REVISAO_VALIDACAO.md`](./REVISAO_VALIDACAO.md))  
> **Data:** 27/06/2026  
> **Documento base:** [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md) · [`REGRAS_DE_NEGOCIO.md`](./REGRAS_DE_NEGOCIO.md)  
> **Objetivo:** Evoluir o protótipo de UI para um **app de treino** funcional —
> **B2B2C**, focado em **aluno + profissional**, para academias **low-mid**.

---

## Estratégia Geral

O escopo foi **reduzido** ao núcleo: o **profissional** monta e **atribui**
treinos; o **aluno** executa e acompanha progresso. Mantém-se a UI existente e
introduz-se, de forma incremental: camada de dados, persistência, autenticação
com 2 papéis e o fluxo de atribuição.

**Saíram do MVP:** Agenda, Relatórios, painel administrativo da academia,
notificações multicanais, 2FA e integrações (ver Seção 7 do relatório).

> ⚠️ **Princípio revisado:** em vez do "big bang" de modelar 8 tabelas antes de
> qualquer fluxo, entregamos uma **fatia vertical fim-a-fim** o quanto antes
> (login → criar treino → atribuir → executar) com poucas entidades, evoluindo o
> schema por fatia. A Fase 0 inclui **preparação arquitetural** porque o protótipo
> não está pronto para receber backend (dados hardcoded em componentes `"use
> client"`).

> 🧩 **Dependências a instalar** (hoje ausentes no `package.json`): `eslint` +
> `eslint-config-next`, `vitest` + `@testing-library/*`, `@playwright/test`,
> `prisma` + `@prisma/client` (+ adapter serverless), `next-auth`/Auth.js (+
> `@auth/prisma-adapter`), provedor de e-mail (ex.: Resend), e a troca de
> `next-pwa` por `@serwist/next` (ou corte do PWA). **Só `zod` já está instalado.**

---

## Fase 0 — Fundação, Preparação Arquitetural e Branding

> Esta fase é maior do que parecia: é pré-requisito real de tudo. Inclui resolver
> branding (bloqueia manifest/SW), preparar a arquitetura para backend, e montar
> a infra mínima (lint, testes, env, CI).

- [ ] **0.1 Branding (item zero):** **definir o nome do produto** e unificar a
      marca (resolver *VIP* vs *FitPro*) em sidebar, `app/layout.tsx` (metadata),
      `public/manifest.json` e comentários. Fazer **antes** de qualquer build de PWA.
- [ ] **0.2 Tipos + dados:** extrair os dados hardcoded dos componentes para
      `lib/mock-data/` e criar **tipos** (`lib/types.ts`) a partir do modelo da
      Seção 6 (com `gymId`, `roles[]`, `snapshot`, status das entidades).
- [ ] **0.3 Preparação arquitetural (crítico):** reduzir `"use client"` às folhas
      interativas; tornar as páginas **Server Components** que recebem dados por
      props via `lib/data/*`. Sem isso, a migração para banco (Fase 1) vira
      reescrita e quebra a UI. `lib/data/*` hoje lê dos mocks; amanhã, da API.
- [ ] **0.4 Tema:** **envolver `{children}` em `<ThemeProvider>` no
      `app/layout.tsx`** (o provider existe em `components/theme-provider.tsx` mas
      não está montado) e ligar o toggle da aba Aparência. (RF-CFG-03, RNF-04)
- [ ] **0.5 Poda do débito de remoção:** ocultar/remover Agenda (menu + rota),
      rodapé "Admin/Gerente", abas de Academia/SMS/2FA em `/configuracoes` e botão
      "Agendar" em trainer-list (ver tabela 1.4 do relatório).
- [ ] **0.6 Qualidade e build honesto:** **instalar e configurar ESLint**
      (`eslint` + `eslint-config-next`, flat config) — hoje só há o script;
      **remover `typescript.ignoreBuildErrors` e `images.unoptimized`** do
      `next.config.mjs` e **zerar os erros de TS reais** (`strict: true` já ativo).
      Instalar **Vitest + RTL** (deps + script `test` + jsdom) com 1 smoke por página.
- [ ] **0.7 Infra mínima:** `.env.example` (`DATABASE_URL`, `AUTH_SECRET`, chave de
      e-mail), documentar ambientes (dev/staging/prod), **CI** (lint + build + test
      em PR) e escolher **error tracking** (ex.: Sentry, free tier). (RNF-10)
- [ ] **0.8 Decisão de stack PWA:** migrar `next-pwa` → **`@serwist/next`**
      (compatível com Next 16/Turbopack) **ou** cortar PWA do MVP. Não deixar para a
      Fase 5. (RNF-02)

**Aceite (mensurável):** nome único aplicado; dados em `lib/`, páginas como Server
Components; tema funcional; débito de remoção podado; **`pnpm lint` e `pnpm build`
verdes SEM flags de supressão**; CI rodando em PR; decisão de PWA registrada.

---

## Fase 1 — Fatia Vertical: Backend + Auth + 1º Fluxo

> Auth e modelo de usuário são modelados **juntos** (o adapter do Auth.js dita as
> tabelas de usuário/sessão — modelá-lo depois força re-migração). O seed só roda
> após o hash existir. Entregar uma **fatia vertical** demonstrável.

- [ ] **1.1 Stack:** Next.js Route Handlers/Server Actions + **Prisma** +
      **PostgreSQL** (Neon/Supabase). Configurar **connection pooling** para
      serverless (Prisma Accelerate / PgBouncer / driver serverless) — Prisma em
      funções serverless esgota o pool sem isso. Avaliar Drizzle como alternativa
      mais leve. *(Resolve "decisão em aberto" de stack.)*
- [ ] **1.2 Schema (auth + núcleo juntos):** modelar `User`(+`roles[]`,`gymId`,
      `status`), `Profile`, `Link` **e** as tabelas do Auth.js (`Account`,
      `Session`, `VerificationToken`) na **mesma** migração inicial, mais
      `WorkoutPlan`+`Exercise` para a 1ª fatia. `gymId` em todas as entidades
      multi-tenant (premissa 1.3 do relatório). Demais tabelas entram por fatia.
- [ ] **1.3 Auth:** login, logout (ligar *Sair* da sidebar), papéis (RBAC), hash
      (argon2/bcrypt), proteção de rotas por middleware, usuário da sessão no lugar
      do fixo. (RF-AUTH-01/03/04)
- [ ] **1.4 Recuperação de senha:** integrar **provedor de e-mail transacional**
      (Resend/SendGrid) — dependência externa com custo e secret; **ou** cortar do
      MVP (reset manual) e registrar como débito. Aceite: e-mail de reset chega em
      < 2 min em staging. (RF-AUTH-02)
- [ ] **1.5 1ª fatia fim-a-fim:** profissional autenticado **cria um WorkoutPlan**
      que é **persistido e lido** do banco numa tela (já via `lib/data/*` real).
      Validação com **zod** (já instalado). Seed mínimo com hash.

**Aceite:** login/logout reais; rotas protegidas por papel; um plano criado por um
profissional persiste no banco e reaparece após reload; migração inclui as tabelas
do Auth.js; pooling configurado.

---

## Fase 2 — Completar Persistência do Núcleo

- [ ] **2.1** Migrar as entidades restantes (`Assignment`, `WorkoutLog`,
      `ExerciseLog`) e portar as telas remanescentes para `lib/data/*` real.
- [ ] **2.2** Política de exclusão = **soft delete** (`status inativo`) para
      entidades com histórico (RN-INV-03); planos excluídos preservam logs (RN-PLA-08).
- [ ] **2.3** Migrações **aditivas** (expand/contract) + `prisma migrate deploy`
      no CI + procedimento de rollback documentado (haverá dados de teste reais).

**Aceite:** todas as telas leem/escrevem do banco; exclusão é soft delete;
pipeline de migração no CI.

---

## Fase 3 — Núcleo: Onboarding + Treinos + Atribuição + Progresso

- [ ] **3.1 Convite e aceite (greenfield — funil B2B2C):** profissional convida
      aluno por link/código → cria `User`(aluno) + `Link` `pendente`; aluno aceita
      → `Link` `ativo`. Tela de onboarding para aluno sem vínculo ativo.
      (RF-VIN-06/07, RN-VIN-09) **Pré-requisito do restante da fase.**
- [ ] **3.2 Profissional — CRUD:** criar/editar/excluir planos e exercícios; aplicar
      limites (RN-LIM-01) e ordem dos exercícios. (RF-TRE-02/03)
- [ ] **3.3 Atribuição:** profissional **atribui** plano a alunos vinculados
      (`Assignment`), com **unicidade** do par ativo (RN-ATR-08); o aluno vê só o
      atribuído. (RF-TRE-04, RF-TRE-06)
- [ ] **3.4 Aluno — execução:** "Iniciar Treino" cria `WorkoutLog` com **snapshot**
      dos exercícios (RN-EXE-09); progresso persiste **incrementalmente** por
      exercício e **recupera** treino interrompido ao reabrir (RF-TRE-15, RN-EXE-11);
      conclusão pede **confirmação** antes de tornar imutável (RN-EXE-10); render do
      vídeo (embed) com fallback. Conclusão deriva só de `ExerciseLog` (sem flag
      mock). (RF-TRE-08/11/12/13/14)
- [ ] **3.5 Estados vazios/erro/carregamento:** aluno novo vê onboarding/empty, não
      dados de terceiros; usar `components/ui/empty.tsx`. (RNF-11)
- [ ] **3.6 Fuso horário:** `WorkoutLog.date` e streak no fuso canônico
      `America/Sao_Paulo`. (RNF-12, RN-EXE-06, RN-INV-05)
- [ ] **3.7 Profissional — acompanhamento:** ver progresso dos seus alunos ativos
      (leitura, RN-SEG-03). (RF-TRE-05)

**Aceite:** convite→aceite funciona; profissional cria e atribui (sem duplicar);
aluno executa, fecha o app no meio e **recupera** o treino; histórico/progresso e
streak refletem dados reais no fuso correto; nenhum botão "morto".

---

## Fase 4 — Vínculo Prof↔Aluno, Perfil e Home por Papel

- [ ] **4.1 Roster do profissional:** lista dos seus alunos; acessar perfil do
      aluno e atribuir treinos. (RF-VIN-01/02)
- [ ] **4.2 Visão do aluno:** ver seu profissional (perfil/contato); cadastro de
      profissional funcional. (RF-VIN-03/05)
- [ ] **4.3 Configurações/Perfil:** persistir perfil e trocar senha; **troca de
      email exige reverificação** (RN-CFG-01); persistir tema. (RF-CFG-01/02/03/04)
- [ ] **4.4 Home por papel:** aluno = meu progresso/treinos do dia; profissional =
      meus alunos/atribuições. (RF-HOME-01/02)
- [ ] **4.5 Ciclo de vida do vínculo:** encerrar vínculo → atribuições `pausada` +
      acesso read-only do aluno (RN-ATR-07); reativação sem duplicar (RN-VIN-07);
      **cascata ao desativar profissional** com alunos ativos (RN-VIN-08).

**Aceite:** vínculo funcional nos dois sentidos incl. encerramento/reativação;
perfil persiste; reverificação de email; home enxuta por papel.

---

## Fase 4.5 — Pré-lançamento (DENTRO do MVP)

> Itens com peso **legal** ou de **confiabilidade** que não são "refino": para um
> app B2B2C que trata dados pessoais (possivelmente sensíveis) de alunos no Brasil,
> são requisitos de lançamento.

- [ ] **PL.1 LGPD mínima:** consentimento no cadastro (dado de treino/biometria
      como sensível), política de privacidade, **exclusão de conta/dados** (apaga
      PII, anonimiza logs — RN-SEG-04), definição controlador×operador. (RNF-08)
- [ ] **PL.2 e2e do happy path:** teste automatizado de ponta a ponta do fluxo
      central (login → convite/aceite → criar → atribuir → executar → recuperar).

**Aceite:** exclusão LGPD funcional; consentimento registrado; e2e do happy path verde.

---

## Fase 5 — Refino Pós-MVP

- [ ] **5.1** Cobertura de testes além do happy path (mais e2e + unitários da camada de dados).
- [ ] **5.2** Auditoria de **acessibilidade** (foco, labels, contraste, teclado). (RNF-03)
- [ ] **5.3** Validar/polir **PWA** se mantido (instalação, offline básico) e checklist de release. (RNF-02)
- [ ] **5.4** Endereçar débitos: registro de carga/peso, hospedagem própria de vídeo, monetização.

**Aceite:** cobertura ampliada; sem bloqueios de acessibilidade; PWA validado (se no escopo).

---

## Sequenciamento

```
Fase 0 ─> Fase 1 ─> Fase 2 ─> Fase 3 ─> Fase 4 ─> Fase 4.5 ║ Fase 5
(base+    (fatia    (resto    (núcleo+  (vínculo/ (pré-     ║ (refino
 arquit.)  vertical) do banco) onboard.) perfil)   lançam.)  ║  pós-MVP)
                                                   └── MVP ──┘
```

- **Fase 0** (incl. preparação arquitetural) é o verdadeiro pré-requisito de tudo.
- **Fase 1** já entrega uma fatia vertical com auth (evita big-bang).
- **Fase 3** é o coração do produto (convidar → atribuir → executar → recuperar).
- **Fase 4.5** (LGPD + e2e) está **dentro** do MVP por ser requisito de lançamento.

---

## Decisões em Aberto

1. **Nome oficial do produto** (substituir `[NOME_DO_APP]`).
2. **Stack de backend/banco:** confirmar Prisma + PostgreSQL (Neon/Supabase) vs.
   alternativa mais leve (Drizzle/Supabase SDK), incl. estratégia de pooling serverless.
3. **PWA:** migrar para `@serwist/next` ou cortar do MVP? (RNF-02)
4. **Recuperação de senha por e-mail** no MVP (provedor + custo) ou reset manual?

> *Resolvida:* "aluno com mais de um profissional?" → **não no MVP** (1 ativo;
> modelo permite N), conforme RN-VIN-03.

---

## Recomendação de MVP

> **Fases 0 → 1 → 2 → 3 → 4 → 4.5 = app lançável.**

Entrega a jornada central (convite/aceite → profissional monta e atribui → aluno
executa e acompanha progresso, com recuperação de sessão) com autenticação por
papel **e** a conformidade LGPD mínima + e2e do happy path exigidos para lançar.
A **Fase 5** (acessibilidade, cobertura ampla, PWA, débitos) refina depois.
Agenda, Relatórios e gestão administrativa ficam para versões seguintes.
