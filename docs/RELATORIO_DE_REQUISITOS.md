# Relatório de Requisitos — `[NOME_DO_APP]` (App de Treino)

> **Versão:** 2.1 (incorpora achados de validação/revisão adversarial — ver [`REVISAO_VALIDACAO.md`](./REVISAO_VALIDACAO.md))  
> **Data:** 27/06/2026  
> **Status do produto:** Protótipo de interface (UI) navegável, sem backend  
> **Branch:** `claude/requirements-report-plan-bz1qad`
>
> **Mudança nesta versão:** o escopo foi **reduzido** de um sistema amplo de
> gestão de academia para um **app de treino** focado em **aluno + profissional**,
> modelo **B2B2C**, para academias **low-mid**. Os módulos *Agenda*, *Relatórios*
> e o *painel administrativo da academia* saíram do MVP (ver Seção 7).

---

## 1. Visão Geral

`[NOME_DO_APP]` é um **app de treino** para academias de porte **low-mid**. O
modelo é **B2B2C**: a academia/profissional usa a ferramenta para **montar e
atribuir treinos**, e o **aluno** usa o app para **executar os treinos e
acompanhar seu progresso**.

A proposta de valor é simples e enxuta — sem o peso de um ERP de academia:
o profissional cria planos de treino e os atribui aos seus alunos; o aluno
recebe, executa, marca exercícios concluídos e vê sua evolução.

> **Marca:** o nome oficial ainda será definido. Ao longo dos documentos usa-se
> o placeholder **`[NOME_DO_APP]`**. Hoje o código tem inconsistência (*VIP
> Academia* na sidebar vs *FitPro Academia* nos metadados/manifest) — será
> unificado quando o nome for escolhido (ver `PLANO_DE_IMPLEMENTACAO.md`, Fase 0).

### 1.1. Stack Tecnológica Atual

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI library | React | 19 |
| Linguagem | TypeScript | 5.7.3 |
| Estilização | Tailwind CSS | 4.2.0 |
| Componentes | shadcn/ui + Radix UI | — |
| Ícones | lucide-react | 0.564.0 |
| Gráficos | recharts | 2.15.0 |
| Formulários | react-hook-form + zod | 7.54 / 3.24 |
| Datas | date-fns | 4.1.0 |
| PWA | next-pwa + manifest.json | 5.6.0 |
| Tema | next-themes (instalado, não conectado) | 0.4.6 |
| Gerenciador de pacotes | pnpm | — |

### 1.2. Observações do Estado Atual

- ⚠️ **Sem persistência:** todos os dados (treinos, profissionais, perfil) são
  constantes no código, com comentários `TODO: Integrar com API`.
- ⚠️ **Sem autenticação:** usuário fixo "Admin/Gerente" na sidebar; *Sair* sem ação.
- ⚠️ **Marca inconsistente:** *VIP* vs *FitPro* (a resolver na escolha do nome).
- ⚠️ **Sem testes** automatizados e **sem camada de dados** (API/banco).
- ℹ️ A rota `app/agenda/` ainda existe no código, mas está **fora do MVP**
  (será ocultada/removida na etapa de implementação).

### 1.3. Premissas Arquiteturais

- **Multi-tenant (academia):** o MVP assume **1 academia por tenant**. A entidade
  `Gym` saiu da UI, mas **mantém-se um `gymId` mínimo no schema desde já** para
  isolar dados entre academias (a busca de RF-VIN-04 não pode varrer uma lista
  global) e não travar o crescimento B2B. *(Sem isso, a 2ª academia cliente
  enxergaria dados da 1ª.)*
- **Preparação arquitetural necessária:** hoje os "mocks" estão **hardcoded
  dentro de componentes `"use client"`** e o estado é `useState` local. Antes de
  plugar backend, é preciso extrair dados para `lib/`, reduzir `"use client"` às
  folhas interativas e tornar as páginas Server Components (ver Plano, Fase 0).

### 1.4. Débito de Remoção (artefatos fora do escopo ainda no código)

A reescrita do escopo **não** removeu o código antigo. Itens a podar/ocultar na
implementação (estimativa não trivial — não é só a rota Agenda):

| Artefato | Local | Ação |
|---|---|---|
| Item de menu "Agenda" | `components/sidebar.tsx` | Ocultar/remover |
| Rodapé fixo "Admin / Gerente" | `components/sidebar.tsx` | Substituir por usuário da sessão |
| Aba "Academia" (nome, endereço, horários) | `app/configuracoes/page.tsx` | Remover (gestão de academia fora do MVP) |
| Notificações SMS/Marketing | `app/configuracoes/page.tsx` | Remover (fora do MVP) |
| Segurança "2FA / Integrações / Sessões" | `app/configuracoes/page.tsx` | Reduzir a "trocar senha" |
| Botão "Agendar" nos cards | `components/personal/trainer-list.tsx` | Remover (depende de Agenda) |
| Dashboard genérico/admin | `app/page.tsx`, `components/dashboard/*` | Refazer como home por papel |

---

## 2. Perfis de Usuário (Personas)

O escopo reduzido define **dois papéis** (RBAC). O gestor/admin da academia
**não faz parte do MVP**.

| Persona | Descrição | Necessidades principais |
|---|---|---|
| **Profissional** (personal/instrutor) | Monta treinos e acompanha alunos | Criar/editar treinos, **atribuir** a alunos, ver progresso dos seus alunos |
| **Aluno** | Cliente que treina | Ver treinos atribuídos, executar, marcar exercícios, acompanhar histórico e progresso |

**Fluxo central (B2B2C):**
`Profissional cria treino → atribui ao aluno → aluno executa e registra progresso → profissional acompanha`.

---

## 3. Requisitos Funcionais (RF)

Legenda: **✅ Implementado (UI)** = existe na interface, com dados mockados ·
**🟡 Parcial** = existe visualmente mas não funciona · **❌ Ausente**.

### 3.1. Autenticação e Papéis

| ID | Requisito | Status |
|---|---|---|
| RF-AUTH-01 | Login / logout (ligar botão *Sair* da sidebar) | ❌ |
| RF-AUTH-02 | Recuperação de senha — **reset manual** pelo profissional/admin no MVP (sem e-mail; self-service por e-mail fica pós-MVP) | ❌ |
| RF-AUTH-03 | Papéis **profissional** e **aluno** (RBAC), com menu e ações condicionais ao papel | ❌ |
| RF-AUTH-04 | Proteção de rotas por sessão/papel | ❌ |

### 3.2. Treinos + Progresso (núcleo)

**Profissional:**

| ID | Requisito | Status |
|---|---|---|
| RF-TRE-01 | Listar planos de treino com dia, duração, calorias e nº de exercícios | ✅ UI (mock) |
| RF-TRE-02 | CRUD de planos de treino | ❌ |
| RF-TRE-03 | CRUD de exercícios (séries, reps, descanso, músculo, vídeo, instruções) | ❌ |
| RF-TRE-04 | **Atribuir** um plano a um ou mais alunos | ❌ |
| RF-TRE-05 | Acompanhar o progresso dos seus alunos | ❌ |

**Aluno:**

| ID | Requisito | Status |
|---|---|---|
| RF-TRE-06 | Ver treinos **atribuídos** a ele | 🟡 (lista existe, mas não é "atribuída") |
| RF-TRE-07 | Expandir/colapsar exercícios de cada treino | ✅ UI |
| RF-TRE-08 | Marcar exercício como concluído (com barra de progresso %) | 🟡 (só estado local da sessão) |
| RF-TRE-09 | Ver detalhes do exercício (séries, reps, descanso, músculo) | ✅ UI (mock) |
| RF-TRE-10 | Modal com vídeo demonstrativo e instruções | 🟡 (URLs de embed do YouTube **presentes nos dados, mas não renderizadas** — o modal exibe só um placeholder) |
| RF-TRE-11 | Reproduzir o vídeo real | ❌ |
| RF-TRE-12 | Iniciar treino → gera registro (`WorkoutLog`) | 🟡 (botão sem ação) |
| RF-TRE-13 | Aba **Histórico** real de treinos realizados | 🟡 (UI mock) |
| RF-TRE-14 | Aba **Progresso** com métricas reais (treinos, calorias, tempo) | 🟡 (UI mock) |
| RF-TRE-15 | **Recuperar treino interrompido**: `WorkoutLog` `em_andamento` persiste por exercício e é restaurado ao reabrir o app (RN-EXE-11) | ❌ |

### 3.3. Vínculo Profissional ↔ Aluno

| ID | Requisito | Status |
|---|---|---|
| RF-VIN-01 | Profissional vê **roster** (lista dos seus alunos) | ❌ (hoje há lista de *trainers*, não de alunos) |
| RF-VIN-02 | Profissional acessa o perfil de um aluno e atribui treinos | ❌ |
| RF-VIN-03 | Aluno vê seu **profissional** (perfil/contato) | 🟡 (lista de trainers existe como UI mock) |
| RF-VIN-04 | Buscar por nome/especialidade | ✅ (filtra mock) |
| RF-VIN-05 | Cadastro de profissional (nome, email, telefone, CREF, especialidades) | 🟡 (formulário sem submissão) |
| RF-VIN-06 | **Convite de aluno** pelo profissional (link/código), criando o aluno e o `Link` em status `pendente` | ❌ *(greenfield — não existe conceito de aluno no app)* |
| RF-VIN-07 | **Aceite do vínculo** pelo aluno; enquanto não houver vínculo `ativo`, exibir onboarding e nenhum treino de terceiros | ❌ *(greenfield)* |

### 3.4. Configurações / Perfil

| ID | Requisito | Status |
|---|---|---|
| RF-CFG-01 | Editar perfil (nome, email, telefone, foto) | 🟡 (sem submissão) |
| RF-CFG-02 | Trocar senha | 🟡 (sem backend) |
| RF-CFG-03 | Tema claro/escuro funcional (next-themes já instalado) | ❌ |
| RF-CFG-04 | Persistir preferências do usuário | ❌ |

### 3.5. Início (Home) por Papel

| ID | Requisito | Status |
|---|---|---|
| RF-HOME-01 | **Aluno:** resumo do próprio progresso e treinos do dia | 🟡 (dashboard atual é genérico/admin, mock) |
| RF-HOME-02 | **Profissional:** resumo dos seus alunos e atribuições | ❌ |

> A home **não** é um painel administrativo: é uma visão enxuta por papel,
> reaproveitando dados de Treinos/Progresso. As métricas globais de academia
> ficam **fora do MVP**.

---

## 4. Requisitos Não-Funcionais (RNF)

| ID | Categoria | Requisito | Status |
|---|---|---|---|
| RNF-01 | **Responsividade** | Layout mobile/desktop (sidebar vira drawer) | ✅ |
| RNF-02 | **PWA** | App **instalável** (manifest + ícones), **sem service worker** no MVP | 🟡 **decidido:** remover `next-pwa@5.6.0` (abandonado, no-op no Turbopack, quebra o build); manter manifest/ícones → installable. Offline/SW (Serwist) reavaliado pós-MVP. "Não perder o treino" resolvido via persistência client-side (IndexedDB/localStorage), não SW |
| RNF-03 | **Acessibilidade** | `aria-label`, `aria-current`, navegação por teclado | 🟡 (parcial) |
| RNF-04 | **Tema** | Claro/escuro real (next-themes) | ❌ (não conectado) |
| RNF-05 | **Persistência** | Banco de dados + API | ❌ |
| RNF-06 | **Segurança** | Auth, hash de senha, proteção de rotas | ❌ |
| RNF-07 | **Qualidade** | Lint e testes automatizados | ❌ **script `lint` existe mas sem config ESLint** (sem `.eslintrc*`/`eslint.config.*` nem dependência `eslint`); testes (Vitest/RTL/Playwright) não instalados |
| RNF-08 | **LGPD** | Tratamento de dados pessoais de alunos | ❌ |
| RNF-09 | **i18n** | Interface em pt-BR | ✅ (apenas pt-BR no MVP) |
| RNF-10 | **Observabilidade** | Analytics (Vercel); rastreio de erros (ex.: Sentry) | 🟡 (analytics sim; error tracking ❌) |
| RNF-11 | **Estados vazios/erro/carregamento** | Cada lista (treinos, roster, histórico, progresso) trata vazio/loading/erro — aluno novo não pode ver dados mock de terceiros (há `components/ui/empty.tsx` disponível e não usado) | ❌ |
| RNF-12 | **Fuso horário** | "Dia"/streak/`WorkoutLog.date` em fuso canônico `America/Sao_Paulo` (RN-INV-05) | ❌ |

> **Reduções vs. v1.0:** notificações multicanais (email/push/SMS/marketing), 2FA
> e integrações externas saíram do MVP.

---

## 5. Regras de Negócio

> 📖 **Regras completas e numeradas (testáveis) em
> [`REGRAS_DE_NEGOCIO.md`](./REGRAS_DE_NEGOCIO.md).** Abaixo, um resumo.

- **RN-01:** Progresso de um treino = `(exercícios concluídos / total) × 100`,
  arredondado (`workout-details.tsx`).
- **RN-02:** Um exercício pode ser marcado/desmarcado como concluído.
- **RN-03:** Um **plano de treino** é criado por um **profissional** e pode ser
  **atribuído** a um ou mais **alunos** (relação via `Assignment`).
- **RN-04:** Um aluno só vê treinos **atribuídos** a ele.
- **RN-05:** Profissionais exigem **CREF** no cadastro.
- **RN-06:** Cada aluno está vinculado a um (ou mais) profissional via `Link`.

---

## 6. Modelo de Dados (reduzido)

```
User       { id, gymId, name, email, passwordHash, roles[](profissional|aluno), avatarUrl, status }
Profile    { userId, phone, prefs(theme), (profissional: cref, specialties[], bio) }
Link       { gymId, professionalId, alunoId, status(pendente|ativo|inativo) }   # único por par
WorkoutPlan{ id, gymId, createdBy(professionalId), name, day, estDuration, estCalories, level, status }
Exercise   { id, workoutPlanId, name, sets, reps, rest, muscle, videoUrl, instructions, order }
Assignment { id, workoutPlanId, alunoId, assignedBy, status(ativa|pausada|concluída), assignedAt }
WorkoutLog { id, alunoId, workoutPlanId, snapshot, status(em_andamento|concluído), date, durationMin, caloriesBurned }
ExerciseLog{ id, workoutLogId, exerciseId, completed }
```

> **Notas:** `gymId` mantém o **tenant** mínimo (premissa 1.3) mesmo sem UI de
> gestão de academia. `roles[]` cobre o profissional que também treina (RN-USR-08).
> `WorkoutLog.snapshot` congela os exercícios no início (RN-EXE-09).
> **Removidos do modelo amplo (v1.0):** `Appointment` e `Notification` multicanal.
> **Débito de produto:** registro de **carga/peso** (kg, peso corporal, medidas) —
> dado-chave de evolução — está **fora do MVP**; reavaliar antes da Fase 3.

---

## 7. Fora do Escopo (versões futuras)

Itens conscientemente **adiados** para manter o MVP enxuto:

- 📅 **Agenda / agendamento** de sessões (rota `app/agenda/` será ocultada).
- 📊 **Relatórios gerenciais** (frequência, ocupação, receita).
- 🏢 **Painel administrativo da academia** (gestão da unidade, horários, multi-academia).
- 🔔 **Notificações** SMS/marketing, **2FA**, **integrações** externas.
- 📈 **Dashboard administrativo** com métricas globais.
- 🌐 **i18n** multi-idioma (MVP só pt-BR).
- 💳 **Monetização/billing** (preço por academia/profissional/aluno ativo). Decisão
  de produto pendente; já influencia o schema (contagem de alunos por `gymId`).
- 🏋️ **Registro de carga/peso e medidas corporais** (ver nota na Seção 6).
- 📹 **Hospedagem própria de vídeo** (hoje embed YouTube — dependência externa,
  tracking/LGPD e sem offline); definir fonte/fallback.

---

## 8. Lacunas e Riscos (no escopo reduzido)

| # | Lacuna / Risco | Impacto | Severidade |
|---|---|---|---|
| 1 | Ausência de backend e persistência | Produto não usável | 🔴 Alta |
| 2 | Sem auth e papéis (profissional/aluno) | Bloqueia o fluxo de atribuição | 🔴 Alta |
| 3 | Atribuição treino→aluno inexistente (núcleo do produto) | Sem isso não há MVP | 🔴 Alta |
| 4 | **Onboarding do aluno não especificado** (convite/aceite) — funil B2B2C bloqueado | Sem isso o profissional não chega ao aluno | 🔴 Alta |
| 5 | **Roster/perfil de aluno é greenfield** (não existe no código; "❌" esconde o esforço) | Maior bloco de trabalho do MVP | 🔴 Alta |
| 6 | **LGPD com dados potencialmente sensíveis** (treino/biometria); exclusão vs imutabilidade | Risco legal/sanção ANPD; requisito de lançamento | 🔴 Alta |
| 7 | **Protótipo não preparado para backend** (`use client` + dados em componentes) | Migração vira reescrita | 🔴 Alta |
| 8 | PWA quebrada (`next-pwa` incompatível) marcada como pronta | Falso-verde; build de produção em risco | 🟠 Média |
| 9 | Nome do produto indefinido (VIP vs FitPro) | Identidade/branding; bloqueia manifest/SW | 🟠 Média |
| 10 | Sem testes automatizados nem error tracking | Risco de regressão silenciosa | 🟠 Média |
| 11 | Sessão de treino sem persistência (perde-se ao recarregar) | Pecado capital de UX em app de treino | 🟠 Média |
| 12 | Tema claro/escuro não funcional | Expectativa de UX | 🟡 Baixa |

---

## 9. Próximos Passos

Plano faseado, com critérios de aceite e recomendação de MVP, em
[`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md).
