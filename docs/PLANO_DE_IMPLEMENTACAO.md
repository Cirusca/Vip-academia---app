# Plano de Implementação — `[NOME_DO_APP]` (App de Treino)

> **Versão:** 2.2 (ajustes de sequência/dimensionamento + segurança — ver [`REVISAO_PLANO_E_SEGURANCA.md`](./REVISAO_PLANO_E_SEGURANCA.md) e [`REVISAO_VALIDACAO.md`](./REVISAO_VALIDACAO.md))  
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

## Princípios de Segurança (transversais — desde a Fase 1)

> Detalhe em [`REVISAO_PLANO_E_SEGURANCA.md`](./REVISAO_PLANO_E_SEGURANCA.md), Parte 3.
> A tríade abaixo é 🔴 e deve ser **arquitetada**, não retrofitada:

- **Isolamento multi-tenant:** `gymId` **sempre** derivado da sessão (nunca do
  cliente); `lib/data/*` injeta `where:{ gymId }` obrigatório (não expor Prisma cru
  às páginas); avaliar **RLS** no Postgres.
- **Autorização no servidor:** Server Actions são endpoints **públicos** — cada
  uma faz `auth()` → checagem de papel/posse/vínculo → `zod.parse` → query escopada.
  Nunca autorizar por ocultação de UI. Nunca retornar entidade crua do Prisma
  (vaza `passwordHash`).
- **Anti-IDOR:** re-buscar o recurso escopado por `gymId`+posse antes de agir;
  **404** ao falhar; unicidade por **constraint no banco**.

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
- [ ] **0.3 Preparação arquitetural (mínimo barato):** criar a fachada
      `lib/data/*` (funções que hoje retornam mocks) e fazer as páginas consumirem
      dados por ela; extrair as **folhas** realmente interativas para `"use client"`.
      **Não** converter as 5 páginas em Server Components em big-bang agora (refator
      caro sem backend) — a conversão RSC é feita **por fatia na Fase 1**, junto da
      tela que ganha banco. `lib/data/*` hoje lê dos mocks; amanhã, da API.
- [ ] **0.4 Tema:** **envolver `{children}` em `<ThemeProvider>` no
      `app/layout.tsx`** (o provider existe em `components/theme-provider.tsx` mas
      não está montado) e ligar o toggle da aba Aparência. (RF-CFG-03, RNF-04)
- [ ] **0.5 Poda do débito de remoção (REMOVER, não ocultar; ANTES de 0.6):**
      deletar Agenda (menu + rota `app/agenda`), rodapé "Admin/Gerente", abas de
      Academia/SMS/2FA em `/configuracoes`, botão "Agendar" e **a tela `/personal`
      (trainer-list é gestão de equipe = admin, fora do MVP)**. Ocultar deixaria
      `app/agenda` quebrando o build honesto de 0.6 (TS2741). Reintrodução futura
      via histórico git. (ver tabela 1.4 do relatório)
- [ ] **0.6 Qualidade e build honesto:** **instalar e configurar ESLint**
      (`eslint` + `eslint-config-next`, flat config) — hoje só há o script;
      **remover `typescript.ignoreBuildErrors` e `images.unoptimized`** do
      `next.config.mjs` e **zerar os erros de TS reais** (`strict: true` já ativo).
      Instalar **Vitest + RTL** (deps + script `test` + jsdom) com 1 smoke por página.
- [ ] **0.7 Infra mínima:** **adicionar `.env` ao `.gitignore`** (hoje cobre só
      `.env*.local` — risco de vazar segredo); `.env.example` só com
      `DATABASE_URL`/`DIRECT_URL`/`AUTH_SECRET` (sem "chave de e-mail" — reset é
      manual); documentar ambientes; **CI** (lint + build + test em PR). Error
      tracking (Sentry) fica como **decisão registrada**; instalação na Fase 1
      (quando houver runtime servidor). Infra de **e2e/Playwright** também aqui. (RNF-10)
- [ ] **0.8 PWA — SEM service worker no MVP (decidido):** **remover `next-pwa`**
      do `next.config.mjs` e do `package.json` (está quebrado/no-op no Turbopack e
      bloqueia o build). **Manter `public/manifest.json` + ícones** → app instalável
      ("adicionar à tela inicial") sem SW. Não migrar para Serwist agora: a trilha
      Turbopack do Serwist ainda é preview/instável (issue #54 aberta, bug
      `__SW_MANIFEST` #294) e não há dado real para cachear. (RNF-02)

**Aceite (mensurável):** nome único aplicado; dados em `lib/`, páginas como Server
Components; tema funcional; débito de remoção podado; **`pnpm lint` e `pnpm build`
verdes SEM flags de supressão**; CI rodando em PR; decisão de PWA registrada.

---

## Fase 1 — Fatia Vertical: Backend + Auth + 1º Fluxo

> Auth e modelo de usuário são modelados **juntos** (o adapter do Auth.js dita as
> tabelas de usuário/sessão — modelá-lo depois força re-migração). O seed só roda
> após o hash existir. Entregar uma **fatia vertical** demonstrável.

- [ ] **1.1 Stack (decidida):** Next.js Route Handlers/Server Actions + **Prisma**
      + **PostgreSQL no Neon** com **`@prisma/adapter-neon` + `@neondatabase/serverless`**
      (driver HTTP, sem pool a esgotar) e `DIRECT_URL` separado p/ `prisma migrate`.
      Singleton `lib/prisma.ts`. Registrar que o free-tier do Neon hiberna (cold
      start no 1º login).
- [ ] **1.2 Schema (auth + núcleo mínimo):** na **mesma** migração inicial,
      tabelas do Auth.js (`Account`, `Session`, `VerificationToken`) + `User`
      (`roles[]`, `gymId`, `status`, `passwordHash`, **`mustChangePassword`**) +
      `WorkoutPlan` + `Exercise` (o que a fatia 1.5 exige). **`Link` entra na Fase 3**
      e `Profile` na Fase 4 (migração aditiva). **Colunas de soft delete** já aqui.
      `gymId` em toda entidade multi-tenant. `VerificationToken` fica inerte (sem e-mail).
- [ ] **1.3 Auth:** **`session.strategy: 'jwt'`** (com adapter o default seria
      DB-session, que não roda no Edge), com `roles[]`/`gymId` no token p/ o gate no
      middleware — que no Next 16 é **`proxy.ts`** (renomeado). Authz fina (escrita)
      re-checada nas Server Actions. Hash com **bcryptjs** (portável; argon2 nativo
      não roda no edge). Login, logout (ligar *Sair*), usuário da sessão no lugar do
      fixo. (RF-AUTH-01/03/04)
- [ ] **1.4 Recuperação de senha — RESET MANUAL (decidido):** no MVP **não** há
      e-mail transacional. **Na Fase 1, reset = operação de seed/dev** (o reset
      pelo profissional depende de `Link`, que só existe na Fase 3). Quando houver:
      senha temporária **aleatória** (operador não escolhe nem vê em claro),
      `mustChangePassword` força troca no 1º login, **audit log** de quem resetou,
      aviso ao aluno. Self-service por e-mail fica pós-MVP. (RF-AUTH-02)
- [ ] **1.5 1ª fatia fim-a-fim:** profissional autenticado **cria um WorkoutPlan**
      que é **persistido e lido** do banco numa tela (já via `lib/data/*` real).
      Validação com **zod** (já instalado). Seed mínimo com hash.

**Aceite:** login/logout reais; rotas protegidas por papel; a criação do plano roda
numa Server Action autorizada (papel=profissional) que **carimba `gymId`/`createdBy`
da sessão**; **teste negativo** — aluno ou usuário de outro `gymId` não cria/lê o
plano (404 no servidor); plano criado com ≥1 Exercise ordenado, validado por zod +
RN-LIM; migração inclui as tabelas do Auth.js; adapter Neon configurado.

---

## Fase 2 — Completar Persistência do Núcleo

- [ ] **2.1** Migrar `Assignment` (casa com a Fase 3.3) + leitura de
      histórico/progresso do banco. **`WorkoutLog`/`ExerciseLog` e a tela de execução
      (snapshot/recuperação) ficam na Fase 3.4** — não duplicar aqui.
- [ ] **2.2** Soft delete: as **colunas** nascem no schema da Fase 1.2; aqui
      garante-se o **filtro padrão** via helper único em `lib/data` (toda query
      exclui inativos) + testes de que listas, **busca (RF-VIN-04)** e **contagem de
      quota (RN-LIM-01)** ignoram registros inativos. (RN-INV-03, RN-PLA-08)
- [ ] **2.3** **Adotar já:** `prisma migrate deploy` no CI (evita drift).
      **Adiar** disciplina expand/contract + runbook de rollback para o 1º deploy
      com dados reais; até lá, reset+reseed do banco de dev/staging é o "rollback".

**Aceite:** telas de **leitura** (roster/histórico/progresso) leem do banco
(execução fica na Fase 3); filtro de soft delete coberto por teste; `migrate deploy` no CI.

---

## Fase 3 — Núcleo: Onboarding + Treinos + Atribuição + Progresso

- [ ] **3.1 Convite e aceite (greenfield — funil B2B2C):** profissional convida
      aluno por link/código → cria `User`(aluno) + `Link` `pendente`; aluno aceita
      → `Link` `ativo`. Tela de onboarding para aluno sem vínculo ativo.
      (RF-VIN-06/07, RN-VIN-09) **Pré-requisito do restante da fase.**
- [ ] **3.2 Profissional — CRUD:** criar/editar/excluir planos e exercícios; aplicar
      limites (RN-LIM-01) e ordem dos exercícios. (RF-TRE-02/03)
- [ ] **3.3 Atribuição (precisa do roster):** **listar meus alunos ativos +
      selecionar** (parte do roster, puxada da Fase 4.1 para cá pois é pré-requisito);
      profissional **atribui** plano a alunos vinculados (`Assignment`); **unicidade**
      do par ativo por **índice único parcial** no Postgres `UNIQUE(workoutPlanId,
      alunoId) WHERE status='ativa'` (RN-ATR-08); o aluno vê só o atribuído. (RF-TRE-04/06)
- [ ] **3.4 Aluno — execução (quebrar em sub-itens):** **(pré-requisito)** remover
      a flag `completed` do mock e fazer `getProgress` derivar só de `ExerciseLog`.
      (i) `WorkoutLog` `em_andamento`→`concluído` com **snapshot** dos exercícios ao
      iniciar (RN-EXE-09); (ii) **confirmação** antes de tornar imutável (RN-EXE-10);
      (iii) render do **embed YouTube real** (`youtube-nocookie.com`) com fallback;
      (iv) persistência incremental + recuperação via **`idb`** (instalar) ou
      localStorage, *last-write-wins* no MVP (sem fila multi-device). (RF-TRE-08/11/12/13/15, RN-EXE-11)
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

- [ ] **4.1 Roster do profissional (greenfield — não reusa trainer-list):** a
      seleção de alunos p/ atribuir já entra na Fase 3.3; aqui fica o **perfil
      detalhado do aluno + histórico**. Filtra por `Link.status=ativo`,
      `professionalId`=sessão, escopado por `gymId`. (RF-VIN-01/02)
- [ ] **4.2 Visão do aluno:** ver seu profissional vinculado (perfil/contato —
      barato). **Cadastro/onboarding do profissional + validação de CREF (RN-USR-05)
      foi movido para a Fase 1** (é pré-requisito de 1.5: sem profissional não há
      quem crie treino). (RF-VIN-03/05)
- [ ] **4.3 Configurações/Perfil:** persistir perfil; **trocar senha** (self-service
      com senha atual, RN-CFG-02 — coexiste com o reset manual de 1.4). **Troca de
      e-mail fica pós-MVP** (e-mail imutável no MVP): reverificação exigiria e-mail
      transacional, que foi cortado (1.4) — evita reintroduzir a dependência por uma
      edição secundária. Tema já vem da Fase 0.4 (localStorage/next-themes); persistir
      no banco fica pós-MVP. (RF-CFG-01/02)
- [ ] **4.4 Home por papel:** aluno = meu progresso/treinos do dia; profissional =
      meus alunos/atribuições. (RF-HOME-01/02)
- [ ] **4.5 Ciclo de vida do vínculo:** **no MVP** — encerrar vínculo →
      atribuições `pausada` + acesso read-only do aluno com aviso ao abrir o app
      (pull, não push — notificação está fora do MVP) (RN-ATR-07); reativação sem
      duplicar (RN-VIN-07). A **cascata ao desativar profissional** (RN-VIN-08) vira
      **débito**: sem admin no MVP não há gatilho de UI — basta a constraint que
      impede atribuição ativa de profissional inativo + procedimento manual documentado.

**Aceite:** vínculo funcional nos dois sentidos incl. encerramento/reativação;
perfil persiste; reverificação de email; home enxuta por papel.

---

## Fase 4.5 — Pré-lançamento (DENTRO do MVP)

> Itens com peso **legal** ou de **confiabilidade** que não são "refino": para um
> app B2B2C que trata dados pessoais (possivelmente sensíveis) de alunos no Brasil,
> são requisitos de lançamento.

- [ ] **PL.1 LGPD mínima:** consentimento **específico e destacado** colhido **no
      aceite do convite** (RN-VIN-09), não no momento em que o profissional cria o
      aluno pendente; registro auditável (timestamp/versão/IP); política de
      privacidade versionada. **Exclusão = HARD DELETE** dos logs do titular
      preservando só agregados desvinculados (mais defensável que "anonimizar"
      registros granulares reidentificáveis) — decidir o cascade na **Fase 2**.
      Enquadramento: tratar o **fornecedor como controlador (ou conjunto)**, não
      "operador"; definir canal/dono da requisição do titular + SLA 15 dias. (RNF-08)
- [ ] **PL.2 e2e (incremental, infra na Fase 0.7/1):** o spec é construído **por
      fatia** (Fase 1 login+criar; Fase 3 atribuir+executar+recuperar), de modo que
      na 4.5 seja "consolidar", não "criar do zero". Inclui o happy path **e ≥1 teste
      negativo de autorização** (aluno A / outro `gymId` não acessa recurso de B → 404).

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

## Decisões

**Em aberto:**
1. **Nome oficial do produto** (substituir `[NOME_DO_APP]`) — *adiado, decidir depois*.

**Confirmadas:**
- ✔ **Backend/banco:** **Prisma + PostgreSQL** (Neon/Supabase), com pooling
  serverless (Accelerate/PgBouncer/driver serverless).
- ✔ **PWA:** **sem service worker no MVP** — remover `next-pwa`, manter manifest
  installable; reavaliar `@serwist/turbopack` pós-MVP (ver Fase 0.8).
- ✔ **Recuperação de senha:** **reset manual** pelo profissional/admin (sem e-mail
  no MVP) — ver Fase 1.4.
- ✔ **Aluno com mais de um profissional?** **Não no MVP** (1 ativo; modelo permite
  N), conforme RN-VIN-03.

---

## Recomendação de MVP

> **Fases 0 → 1 → 2 → 3 → 4 → 4.5 = app lançável.**

Entrega a jornada central (convite/aceite → profissional monta e atribui → aluno
executa e acompanha progresso, com recuperação de sessão) com autenticação por
papel **e** a conformidade LGPD mínima + e2e do happy path exigidos para lançar.
A **Fase 5** (acessibilidade, cobertura ampla, PWA, débitos) refina depois.
Agenda, Relatórios e gestão administrativa ficam para versões seguintes.
