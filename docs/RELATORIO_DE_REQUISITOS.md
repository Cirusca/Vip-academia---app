# Relatório de Requisitos — VIP Academia

> **Versão:** 1.0  
> **Data:** 27/06/2026  
> **Status do produto:** Protótipo de interface (UI) navegável, sem backend  
> **Branch:** `claude/requirements-report-plan-bz1qad`

---

## 1. Visão Geral

O **VIP Academia** (também referido no código como *FitPro Academia*) é um sistema de
gestão de academia construído como aplicação web responsiva com suporte a PWA
(instalável em dispositivos móveis). O objetivo do produto é centralizar a gestão
de **treinos**, **personal trainers**, **agenda de compromissos** e
**configurações** da academia, oferecendo tanto uma visão administrativa quanto a
experiência do aluno acompanhando seus treinos.

No estado atual, o projeto é um **protótipo de front-end totalmente funcional do
ponto de vista visual e de navegação**, porém **todos os dados são mockados
(fixos em código)** e nenhuma ação persiste. Este relatório documenta o que já
existe, o que está implícito/planejado e o que falta para o produto se tornar
operacional.

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
| Analytics | @vercel/analytics | 1.6.1 |
| Gerenciador de pacotes | pnpm | — |

### 1.2. Observações Importantes do Estado Atual

- ⚠️ **Inconsistência de marca:** a sidebar exibe *"VIP Academia"*, enquanto os
  metadados (`app/layout.tsx`) e o `manifest.json` usam *"FitPro Academia"*.
  É necessário padronizar o nome oficial do produto.
- ⚠️ **Sem persistência:** todos os dados (treinos, trainers, agendamentos,
  perfil) são constantes no código com comentários `TODO: Integrar com API`.
- ⚠️ **Sem autenticação:** o usuário "Admin / Gerente" é fixo na sidebar; o botão
  *Sair* não tem ação.
- ⚠️ **Módulos planejados ausentes:** os comentários em `app-layout.tsx`
  mencionam itens de menu *Alunos* e *Relatórios* que **não existem** como rotas.
- ⚠️ **Sem testes** automatizados e **sem camada de dados** (API/banco).

---

## 2. Perfis de Usuário (Personas)

O sistema mistura, hoje, duas experiências no mesmo app. Os requisitos abaixo
assumem os seguintes perfis:

| Persona | Descrição | Necessidades principais |
|---|---|---|
| **Administrador / Gerente** | Gerencia a academia, equipe e configurações | Cadastrar/gerir trainers, ver métricas globais, configurar a academia |
| **Personal Trainer** | Profissional que atende alunos | Gerir agenda, ver seus alunos, montar treinos |
| **Aluno** | Cliente da academia | Ver e executar seus treinos, acompanhar progresso, agendar |

> **Decisão pendente:** definir se haverá um único app com papéis (RBAC) ou apps
> separados (admin vs. aluno). O protótipo atual sugere um único app com papéis.

---

## 3. Requisitos Funcionais (RF)

Legenda de status:
**✅ Implementado (UI)** = existe na interface, com dados mockados ·
**🟡 Parcial** = existe visualmente mas não funciona de fato ·
**❌ Ausente** = não existe.

### 3.1. Módulo: Dashboard (`/`)

| ID | Requisito | Status |
|---|---|---|
| RF-DASH-01 | Exibir cartões de métricas (treinos na semana, duração média, calorias, sequência) | ✅ UI (mock) |
| RF-DASH-02 | Exibir gráfico de atividade/duração dos treinos | ✅ UI (mock) |
| RF-DASH-03 | Exibir atividades recentes | ✅ UI (mock) |
| RF-DASH-04 | Exibir lista resumida de treinos com acesso rápido | ✅ UI (mock) |
| RF-DASH-05 | Calcular métricas a partir de dados reais do usuário | ❌ |

### 3.2. Módulo: Treinos (`/treinos`)

| ID | Requisito | Status |
|---|---|---|
| RF-TRE-01 | Listar planos de treino (A, B, C) com dia, duração, calorias e nº de exercícios | ✅ UI (mock) |
| RF-TRE-02 | Expandir/colapsar exercícios de cada treino | ✅ UI |
| RF-TRE-03 | Marcar exercício como concluído (com barra de progresso %) | 🟡 (só estado local da sessão) |
| RF-TRE-04 | Exibir detalhes do exercício (séries, reps, descanso, músculo) | ✅ UI (mock) |
| RF-TRE-05 | Abrir modal com vídeo demonstrativo e instruções | 🟡 (modal é placeholder, vídeo não toca) |
| RF-TRE-06 | Aba **Histórico** de treinos realizados | ✅ UI (mock) |
| RF-TRE-07 | Aba **Progresso** com métricas de evolução | ✅ UI (mock) |
| RF-TRE-08 | Botão "Iniciar Treino" / "Novo Treino" | 🟡 (sem ação) |
| RF-TRE-09 | Criar/editar/excluir planos de treino (CRUD) | ❌ |
| RF-TRE-10 | Persistir conclusão de exercícios e gerar histórico real | ❌ |
| RF-TRE-11 | Reproduzir o vídeo real (YouTube embed já presente nos dados) | ❌ |

### 3.3. Módulo: Personal Trainers (`/personal`)

| ID | Requisito | Status |
|---|---|---|
| RF-PER-01 | Listar trainers com avatar, experiência, especialidades e disponibilidade | ✅ UI (mock) |
| RF-PER-02 | Exibir métricas por trainer (avaliação, nº de alunos, certificações) | ✅ UI (mock) |
| RF-PER-03 | Buscar trainer por nome ou especialidade | ✅ (filtra mock) |
| RF-PER-04 | Formulário de cadastro de novo personal (nome, email, telefone, CREF, etc.) | 🟡 (formulário sem submissão) |
| RF-PER-05 | Filtros avançados (botão "Filtros") | ❌ (botão sem ação) |
| RF-PER-06 | Ações "Agendar" e "Ver Perfil" | ❌ (sem ação) |
| RF-PER-07 | CRUD completo de trainers com persistência | ❌ |

### 3.4. Módulo: Agenda (`/agenda`)

| ID | Requisito | Status |
|---|---|---|
| RF-AGE-01 | Calendário mensal navegável (mês anterior/próximo) | ✅ UI |
| RF-AGE-02 | Selecionar dia e listar agendamentos do dia | 🟡 (lista é fixa, não muda por dia) |
| RF-AGE-03 | Exibir agendamentos com tipo, status, cliente, trainer, local | ✅ UI (mock) |
| RF-AGE-04 | Legenda por tipo (treino, avaliação, reunião) | ✅ UI |
| RF-AGE-05 | Cartões de resumo (hoje, semana, mês, pendentes) | ✅ UI (mock) |
| RF-AGE-06 | Criar novo agendamento ("Novo Agendamento") | ❌ (botão sem ação) |
| RF-AGE-07 | Editar/cancelar agendamento | ❌ (botão "Editar" sem ação) |
| RF-AGE-08 | Filtrar agendamentos por tipo/trainer | ❌ |
| RF-AGE-09 | Vincular agendamentos a trainers e alunos reais | ❌ |

### 3.5. Módulo: Configurações (`/configuracoes`)

| ID | Requisito | Status |
|---|---|---|
| RF-CFG-01 | Aba **Perfil** (dados pessoais, foto) | 🟡 (formulário sem submissão) |
| RF-CFG-02 | Aba **Academia** (nome, endereço, horários, contato) | 🟡 (sem submissão) |
| RF-CFG-03 | Aba **Notificações** (email, push, SMS, marketing) | 🟡 (toggles só em estado local) |
| RF-CFG-04 | Aba **Segurança** (trocar senha, 2FA, sessões ativas) | 🟡 (sem backend) |
| RF-CFG-05 | Aba **Aparência** (tema claro/escuro, idioma) | 🟡 (toggle de tema não aplica de fato) |
| RF-CFG-06 | Persistir preferências do usuário | ❌ |
| RF-CFG-07 | Aplicar tema claro/escuro de verdade (next-themes já instalado) | ❌ |

### 3.6. Módulos Planejados / Ausentes

| ID | Requisito | Status |
|---|---|---|
| RF-ALU-01 | **Módulo Alunos:** cadastro, listagem, perfil e planos de cada aluno | ❌ (mencionado em comentários, sem rota) |
| RF-REL-01 | **Módulo Relatórios:** relatórios gerenciais (frequência, receita, ocupação) | ❌ (mencionado em comentários, sem rota) |
| RF-AUTH-01 | **Autenticação:** login, logout, recuperação de senha | ❌ |
| RF-AUTH-02 | **Autorização (RBAC):** papéis admin / trainer / aluno | ❌ |

---

## 4. Requisitos Não-Funcionais (RNF)

| ID | Categoria | Requisito | Status |
|---|---|---|---|
| RNF-01 | **Responsividade** | Layout adaptável mobile/desktop (sidebar vira drawer) | ✅ |
| RNF-02 | **PWA** | App instalável com manifest e ícones | ✅ (config presente) |
| RNF-03 | **Acessibilidade** | `aria-label`, `aria-current`, navegação por teclado | 🟡 (parcial, presente em vários pontos) |
| RNF-04 | **i18n** | Interface em pt-BR; troca de idioma | 🟡 (apenas pt-BR; botão "Alterar" sem ação) |
| RNF-05 | **SEO** | Metadados, Open Graph, keywords | ✅ |
| RNF-06 | **Performance** | Otimização de fontes (next/font), code splitting do App Router | ✅ (padrão Next) |
| RNF-07 | **Tema** | Suporte a claro/escuro (next-themes instalado) | ❌ (não conectado) |
| RNF-08 | **Persistência** | Banco de dados e API | ❌ |
| RNF-09 | **Segurança** | Auth, hashing de senha, proteção de rotas, 2FA | ❌ |
| RNF-10 | **Observabilidade** | Analytics (Vercel) em produção | ✅ (básico) |
| RNF-11 | **Qualidade** | Lint configurado; testes automatizados | 🟡 (lint sim; testes não) |
| RNF-12 | **LGPD/Privacidade** | Tratamento de dados pessoais de alunos | ❌ |

---

## 5. Regras de Negócio Identificadas

Extraídas do comportamento atual do protótipo:

- **RN-01:** O progresso de um treino é `(exercícios concluídos / total) × 100`,
  arredondado (`workout-details.tsx`).
- **RN-02:** Um exercício pode ser marcado/desmarcado como concluído; o estado
  inicial pode vir pré-marcado (`completed: true`).
- **RN-03:** Trainers têm status de disponibilidade (`Disponível` / `Ocupado`)
  que afeta a captação de novos alunos.
- **RN-04:** Agendamentos possuem **tipo** (treino, avaliação, reunião) e
  **status** (confirmado, pendente, cancelado), cada um com código de cor.
- **RN-05:** Trainers exigem **CREF** (registro profissional) no cadastro.
- **RN-06:** Horário de funcionamento da academia é definido por abertura/fechamento.

---

## 6. Modelo de Dados Proposto

Derivado das estruturas mockadas. Servirá de base para o schema do banco.

```
User            { id, name, email, phone, passwordHash, role(admin|trainer|aluno), avatarUrl, createdAt }
Gym             { id, name, address, phone, email, openTime, closeTime, logoUrl }
Trainer         { id, userId, cref, specialties[], rating, experienceYears, available, certifications[] }
Student (Aluno) { id, userId, plan, trainerId?, status, joinedAt }
WorkoutPlan     { id, ownerId, name, day, estDuration, estCalories, level, createdAt }
Exercise        { id, workoutPlanId, name, sets, reps, rest, muscle, videoUrl, instructions, order }
WorkoutLog      { id, studentId, workoutPlanId, date, durationMin, caloriesBurned }
ExerciseLog     { id, workoutLogId, exerciseId, completed }
Appointment     { id, title, type, status, date, time, durationMin, studentId, trainerId, location }
Notification    { id, userId, channelPrefs{email,push,sms,marketing} }
```

---

## 7. Lacunas e Riscos

| # | Lacuna / Risco | Impacto | Severidade |
|---|---|---|---|
| 1 | Ausência total de backend e persistência | Produto não usável em produção | 🔴 Alta |
| 2 | Sem autenticação/autorização | Bloqueia multi-usuário e segurança | 🔴 Alta |
| 3 | Inconsistência de marca (VIP vs FitPro) | Confusão de identidade | 🟠 Média |
| 4 | Módulos Alunos e Relatórios ausentes | Cobertura funcional incompleta | 🟠 Média |
| 5 | Sem testes automatizados | Risco de regressão | 🟠 Média |
| 6 | Tema claro/escuro não funcional | Expectativa de UX não atendida | 🟡 Baixa |
| 7 | LGPD não endereçada | Risco legal ao tratar dados de alunos | 🟠 Média |
| 8 | Formulários sem validação/submissão real | Não capturam dados | 🟠 Média |

---

## 8. Próximos Passos

O plano de implementação detalhado, faseado e com critérios de aceite está em
[`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md).
