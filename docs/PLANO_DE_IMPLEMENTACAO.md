# Plano de Implementação — `[NOME_DO_APP]` (App de Treino)

> **Versão:** 2.0 (escopo reduzido — MVP)  
> **Data:** 27/06/2026  
> **Documento base:** [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md)  
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

---

## Fase 0 — Fundação e Branding (rápida, baixo risco)

- [ ] **0.1** **Definir o nome do produto** e unificar a marca (resolver *VIP* vs
      *FitPro*): sidebar, `app/layout.tsx` (metadata) e `public/manifest.json`.
- [ ] **0.2** Centralizar os dados mockados em `lib/mock-data/` e criar **tipos
      TypeScript** (`lib/types.ts`) a partir do modelo reduzido (Seção 6 do relatório).
- [ ] **0.3** Criar camada de acesso a dados (`lib/data/*`) que hoje lê dos mocks
      e amanhã chamará a API — a UI passa a consumir só essa camada.
- [ ] **0.4** Conectar **tema claro/escuro** via `next-themes` (`ThemeProvider`
      já existe em `components/theme-provider.tsx`) e ligar o toggle da aba
      Aparência. (RF-CFG-03, RNF-04)
- [ ] **0.5** Ocultar/remover do menu o item **Agenda** (fora do MVP) e configurar
      base de testes (Vitest + RTL); garantir `pnpm lint` e `pnpm build` verdes.

**Aceite:** nome único; mocks centralizados e tipados; tema funcional; Agenda
fora do menu; build/lint/testes passando.

---

## Fase 1 — Backend, Persistência e Camada de Dados

- [ ] **1.1** Stack de dados **recomendada:** Next.js Route Handlers/Server
      Actions + **Prisma** + **PostgreSQL** (Neon/Supabase), no mesmo repositório.
- [ ] **1.2** Modelar o schema Prisma a partir do **modelo reduzido**
      (User, Profile, Link, WorkoutPlan, Exercise, Assignment, WorkoutLog, ExerciseLog).
- [ ] **1.3** Migrations + **seed** com os dados mockados atuais (telas idênticas,
      agora vindas do banco).
- [ ] **1.4** Implementar `lib/data/*` sobre a API/DB (substitui a versão mock da
      Fase 0 sem alterar a UI).
- [ ] **1.5** Validação de entrada com **zod** (já instalado) em todas as mutações.

**Aceite:** todas as telas leem do banco; seed reproduz o estado atual; mutações validadas.

---

## Fase 2 — Autenticação e Papéis (profissional / aluno)

- [ ] **2.1** Auth (**Auth.js/NextAuth** ou similar): login, logout (ligar *Sair*
      da sidebar), recuperação de senha. (RF-AUTH-01/02)
- [ ] **2.2** Hash de senha (bcrypt/argon2) e proteção de rotas via middleware.
      (RF-AUTH-04)
- [ ] **2.3** Papéis **profissional** e **aluno** (RBAC); menu e ações renderizados
      por papel; substituir o usuário fixo pela sessão. (RF-AUTH-03)

**Aceite:** login/logout reais; rotas protegidas; UI condicional ao papel.

---

## Fase 3 — Núcleo: Treinos + Atribuição + Progresso

- [ ] **3.1 Profissional — CRUD:** criar/editar/excluir planos e exercícios
      (séries, reps, descanso, músculo, vídeo, instruções). (RF-TRE-02/03)
- [ ] **3.2 Atribuição:** profissional **atribui** um plano a um ou mais alunos
      (`Assignment`); o aluno passa a ver só o que lhe foi atribuído.
      (RF-TRE-04, RF-TRE-06)
- [ ] **3.3 Aluno — execução:** "Iniciar Treino" gera `WorkoutLog`; conclusão de
      exercícios persiste (`ExerciseLog`) e alimenta Histórico e Progresso reais;
      reproduzir o vídeo (embed YouTube já presente). (RF-TRE-08/11/12/13/14)
- [ ] **3.4 Profissional — acompanhamento:** ver o progresso dos seus alunos.
      (RF-TRE-05)

**Aceite:** profissional cria e atribui; aluno executa; histórico e progresso
refletem dados reais; nenhum botão "morto" no fluxo.

---

## Fase 4 — Vínculo Prof↔Aluno, Perfil e Home por Papel

- [ ] **4.1 Roster do profissional:** lista dos seus alunos; acessar perfil do
      aluno e atribuir treinos. (RF-VIN-01/02)
- [ ] **4.2 Visão do aluno:** ver seu profissional (perfil/contato); cadastro de
      profissional funcional. (RF-VIN-03/05)
- [ ] **4.3 Configurações/Perfil:** persistir perfil e trocar senha. (RF-CFG-01/02/04)
- [ ] **4.4 Home por papel:** aluno = meu progresso/treinos do dia; profissional =
      meus alunos/atribuições. (RF-HOME-01/02)

**Aceite:** vínculo funcional nos dois sentidos; perfil persiste; home enxuta por papel.

---

## Fase 5 — Qualidade, Conformidade e Lançamento

- [ ] **5.1** Testes e2e (Playwright) dos fluxos críticos: login, criar treino,
      atribuir, executar.
- [ ] **5.2** Auditoria de **acessibilidade** (foco, labels, contraste, teclado). (RNF-03)
- [ ] **5.3** **LGPD** mínima: política de privacidade, consentimento, exclusão de
      dados pessoais. (RNF-08)
- [ ] **5.4** Validar **PWA** (instalação, offline básico) e checklist de release.

**Aceite:** fluxos críticos testados; sem bloqueios de acessibilidade; LGPD
mínima; PWA validado.

---

## Sequenciamento

```
Fase 0 ──> Fase 1 ──> Fase 2 ──> Fase 3 ──> Fase 4 ──> Fase 5
(base)     (dados)    (auth)     (núcleo)   (vínculo)  (qualidade)
```

- Fases **0 e 1** são pré-requisito de tudo.
- **Fase 2** habilita os papéis usados nas Fases 3–4.
- **Fase 3** é o coração do produto (atribuir → executar).

---

## Decisões em Aberto

1. **Nome oficial do produto** (substituir `[NOME_DO_APP]`).
2. **Stack de backend/banco:** confirmar Prisma + PostgreSQL (Neon/Supabase).
3. **Atribuição:** um aluno pode ter mais de um profissional? (afeta `Link`)

---

## Recomendação de MVP

> **Fases 0 → 1 → 2 → 3 → 4 = app lançável.**

Entrega a jornada central (profissional monta e atribui treinos; aluno executa e
acompanha progresso) com autenticação por papel. A **Fase 5** (testes e2e, LGPD,
PWA) refina para produção. Agenda, Relatórios e gestão administrativa ficam para
versões seguintes.
