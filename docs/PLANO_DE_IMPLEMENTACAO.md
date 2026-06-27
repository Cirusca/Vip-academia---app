# Plano de Implementação — VIP Academia

> **Versão:** 1.0  
> **Data:** 27/06/2026  
> **Documento base:** [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md)  
> **Objetivo:** Evoluir o protótipo de UI para um produto funcional, com dados
> reais, autenticação e os módulos faltantes.

---

## Estratégia Geral

O produto hoje é um **front-end completo com dados mockados**. O caminho mais
eficiente é manter a UI existente e introduzir, de forma incremental:

1. Uma **camada de dados** (estado/serviços) que substitua os mocks.
2. **Persistência** (banco + API).
3. **Autenticação e papéis**.
4. Os **módulos ausentes** (Alunos, Relatórios).
5. **Qualidade** (validação, testes, acessibilidade, tema).

Cada fase entrega valor de forma independente e pode ser feita em PRs separados.

---

## Fase 0 — Fundação e Padronização (rápida, baixo risco)

**Meta:** alinhar a base antes de construir sobre ela.

- [ ] **0.1** Padronizar a marca (decidir entre *VIP Academia* e *FitPro
      Academia*) em sidebar, `layout.tsx` metadata e `manifest.json`.
- [ ] **0.2** Centralizar os dados mockados em `lib/mock-data/` (extrair dos
      componentes), criando **tipos TypeScript** (`lib/types.ts`) a partir do
      modelo de dados do relatório. Isso desacopla UI de origem de dados.
- [ ] **0.3** Criar camada de acesso a dados abstrata (`lib/data/*`) que hoje
      lê dos mocks e amanhã chamará a API — UI passa a consumir só essa camada.
- [ ] **0.4** Conectar o **tema claro/escuro** real via `next-themes`
      (`ThemeProvider` já existe em `components/theme-provider.tsx`) e ligar o
      toggle da aba Aparência (RNF-07, RF-CFG-07).
- [ ] **0.5** Configurar testes (Vitest + React Testing Library) e um teste
      smoke por página. Garantir `pnpm lint` e `pnpm build` verdes no CI.

**Critério de aceite:** marca única; mocks centralizados e tipados; tema
funcional; build/lint/testes passando no CI.

---

## Fase 1 — Backend, Persistência e Camada de Dados

**Meta:** dados reais, ainda sem multiusuário.

- [ ] **1.1** Escolher stack de dados. **Recomendado:** Next.js Route
      Handlers/Server Actions + **Prisma** + **PostgreSQL** (ex.: Neon/Supabase),
      mantendo tudo no mesmo repositório.
- [ ] **1.2** Modelar o schema Prisma a partir da Seção 6 do relatório
      (User, Gym, Trainer, Student, WorkoutPlan, Exercise, WorkoutLog,
      ExerciseLog, Appointment, Notification).
- [ ] **1.3** Criar migrations e um **seed** com os dados mockados atuais
      (mantém a tela idêntica, agora vinda do banco).
- [ ] **1.4** Implementar a camada `lib/data/*` sobre a API/DB (substitui a
      implementação mock da Fase 0 sem mudar a UI).
- [ ] **1.5** Validação de entrada com **zod** (já instalado) em todas as
      mutações.

**Critério de aceite:** todas as telas leem do banco; seed reproduz o estado
atual; mutações validadas.

---

## Fase 2 — Autenticação e Autorização

**Meta:** multiusuário seguro com papéis.

- [ ] **2.1** Implementar auth (**Auth.js/NextAuth** ou similar) com login,
      logout (ligar botão *Sair* da sidebar) e recuperação de senha. (RF-AUTH-01)
- [ ] **2.2** Hashing de senha (bcrypt/argon2) e proteção de rotas via
      middleware.
- [ ] **2.3** Papéis **admin / trainer / aluno** (RBAC) e renderização
      condicional do menu e das ações por papel. (RF-AUTH-02)
- [ ] **2.4** Substituir o usuário fixo "Admin/Gerente" pelo usuário da sessão.
- [ ] **2.5** Aba **Segurança** funcional (trocar senha, 2FA opcional, sessões
      ativas reais). (RF-CFG-04)

**Critério de aceite:** login/logout reais; rotas protegidas; menu por papel;
troca de senha persistida.

---

## Fase 3 — CRUDs dos Módulos Existentes

**Meta:** tornar funcionais as ações que hoje são apenas visuais.

- [ ] **3.1 Treinos:** CRUD de planos e exercícios; "Iniciar Treino" gera um
      `WorkoutLog`; conclusão de exercícios persiste e alimenta Histórico e
      Progresso reais; reproduzir o vídeo (embed YouTube já presente nos dados).
      (RF-TRE-09/10/11)
- [ ] **3.2 Personal Trainers:** submissão do formulário de cadastro com
      validação; ações *Agendar*, *Ver Perfil* e *Filtros*; CRUD completo.
      (RF-PER-04/05/06/07)
- [ ] **3.3 Agenda:** criar/editar/cancelar agendamentos; lista filtrada pelo
      **dia selecionado** (corrigir RF-AGE-02); filtros por tipo/trainer; vínculo
      com trainers e alunos reais. (RF-AGE-06/07/08/09)
- [ ] **3.4 Configurações:** persistir Perfil, Academia e Notificações.
      (RF-CFG-01/02/03/06)
- [ ] **3.5 Dashboard:** calcular as métricas a partir de dados reais do usuário.
      (RF-DASH-05)

**Critério de aceite:** nenhum botão "morto"; toda ação persiste e reflete nas
demais telas.

---

## Fase 4 — Módulos Ausentes

**Meta:** completar a cobertura funcional prevista.

- [ ] **4.1 Módulo Alunos (`/alunos`):** listagem, busca, cadastro, perfil,
      vínculo com trainer e plano de treino. Adicionar item na sidebar.
      (RF-ALU-01)
- [ ] **4.2 Módulo Relatórios (`/relatorios`):** relatórios gerenciais
      (frequência, ocupação por horário, desempenho de trainers, evolução de
      alunos) usando **recharts** (já instalado). Adicionar item na sidebar.
      (RF-REL-01)

**Critério de aceite:** ambos os módulos navegáveis, com dados reais e itens de
menu visíveis conforme o papel.

---

## Fase 5 — Qualidade, Conformidade e Lançamento

**Meta:** prontidão para produção.

- [ ] **5.1** Cobertura de testes (unitários para a camada de dados; e2e com
      Playwright para fluxos críticos — login, criar treino, agendar).
- [ ] **5.2** Auditoria de **acessibilidade** (foco, labels, contraste,
      navegação por teclado). (RNF-03)
- [ ] **5.3** **i18n** real (botão de troca de idioma funcional). (RNF-04)
- [ ] **5.4** **LGPD:** política de privacidade, consentimento, e gestão/
      exclusão de dados pessoais de alunos. (RNF-12)
- [ ] **5.5** Validar PWA (instalação, offline básico, screenshots do manifest).
- [ ] **5.6** Observabilidade (erros + analytics) e checklist de release.

**Critério de aceite:** fluxos críticos testados; sem bloqueios de
acessibilidade; conformidade LGPD mínima; PWA validado.

---

## Sequenciamento e Dependências

```
Fase 0 ──> Fase 1 ──> Fase 2 ──> Fase 3 ──> Fase 4 ──> Fase 5
(base)     (dados)    (auth)     (CRUDs)    (módulos)  (qualidade)
```

- Fases **0 e 1** são pré-requisito de tudo.
- **Fase 2** habilita segurança e papéis usados nas Fases 3–4.
- **Fases 3 e 4** podem rodar parcialmente em paralelo após a Fase 2, por módulo.

---

## Decisões em Aberto (precisam de definição do produto)

1. **Marca oficial:** *VIP Academia* ou *FitPro Academia*?
2. **Arquitetura de usuários:** app único com papéis (recomendado) ou apps
   separados admin/aluno?
3. **Stack de backend/banco:** confirmar Prisma + PostgreSQL (Neon/Supabase) vs.
   alternativa (Firebase, etc.).
4. **Escopo do MVP:** quais módulos entram na primeira versão paga/lançável?

---

## Recomendação de MVP

Para o primeiro lançamento utilizável, sugere-se:

> **Fases 0 → 1 → 2 → 3.1 (Treinos) → 3.3 (Agenda)**

Isso entrega a jornada central (aluno acompanha treinos reais; academia gerencia
agenda) com autenticação, deixando Relatórios, módulo Alunos completo e refinos
para versões seguintes.
