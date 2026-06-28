# Revisão de Validação e Revisão Adversarial — Consolidado

> **Data:** 27/06/2026  
> **Método:** Para cada documento (Requisitos, Plano, Regras de Negócio) foram
> executados **2 agentes**: um de **validação** (correção/consistência vs. código
> real) e um **adversarial** (caça a lacunas, casos de borda e riscos). Total: 6 agentes.

Este documento consolida os achados, marca o que foi **aplicado** nesta rodada e o
que fica como **débito** rastreável. Severidades: 🔴 Crítica · 🟠 Alta · 🟡 Média · ⚪ Baixa.

---

## 1. Vereditos

| Documento | Validação | Adversarial |
|---|---|---|
| `RELATORIO_DE_REQUISITOS.md` | Aprovado com ressalvas | 12 achados (3 críticos) |
| `PLANO_DE_IMPLEMENTACAO.md` | Aprovado com ressalvas | 12 achados (3 críticos) |
| `REGRAS_DE_NEGOCIO.md` | Aprovado com ressalvas (0 contradições) | 12 achados (3 críticos) |

---

## 2. Achados factuais (afirmações erradas sobre o código) — CORRIGIDOS

| # | Sev | Achado | Evidência | Ação |
|---|---|---|---|---|
| F1 | 🟠 | "Lint configurado" (RNF-07) é falso: existe o script `eslint .`, mas **não há config ESLint** nem a dependência `eslint`. | `package.json` (sem `eslint` em devDeps; sem `.eslintrc*`/`eslint.config.*`) | ✅ RNF-07 corrigido; tarefa add ao Plano Fase 0 |
| F2 | 🔴 | PWA marcado "✅ config presente": `next-pwa@5.6.0` está **abandonado e incompatível com Next 16/Turbopack**; nenhum service worker é gerado. | `next.config.mjs`; `package.json`; Next 16 usa Turbopack por padrão | ✅ RNF-02 rebaixado; decisão movida p/ Fase 0 |
| F3 | 🟡 | "Build verde" é vácuo: `typescript.ignoreBuildErrors: true` suprime erros de TS (com `strict: true`). | `next.config.mjs` | ✅ Critério de aceite da Fase 0 ajustado |
| F4 | 🟡 | RF-TRE-10: embed do YouTube está **nos dados, mas não é renderizado** (modal só mostra placeholder). | `components/workouts/workout-details.tsx:650-659` | ✅ Texto esclarecido |

---

## 3. Lacunas críticas de produto/arquitetura — APLICADAS

| # | Sev | Achado | Ação |
|---|---|---|---|
| C1 | 🔴 | **Entrada do aluno no app não especificada** (como o aluno passa a existir, é convidado e aceita o vínculo). Bloqueia o funil B2B2C. | ✅ RF-VIN-06/07 + RN-VIN-09 (onboarding/convite-aceite) |
| C2 | 🔴 | **Sem tenant/`Gym`** num produto vendido a múltiplas academias: busca/listas são globais. | ✅ Premissa de tenant declarada + `gymId` recomendado no schema |
| C3 | 🔴 | **Migração mock→banco "sem quebrar UI" é impossível como descrita**: dados estão hardcoded dentro de componentes `"use client"`; trocar `lib/data/*` é, na prática, refator server/client. | ✅ Fase 0 ganha "preparação arquitetural" |
| C4 | 🔴 | **`WorkoutLog` em andamento** sem ciclo de vida: sessão interrompida perde tudo; editar plano durante execução corrompe progresso. | ✅ RN-EXE-09 (snapshot ao iniciar) + RF de persistência incremental |
| C5 | 🔴 | **Vínculo encerrado → aluno sem treinos**; estado-alvo ambíguo (`pausada`/`inativa`). | ✅ RN-ATR-07 refinado (read-only) |
| C6 | 🟠 | **LGPD subdimensionada**: dados de treino/biometria podem ser **sensíveis**; colisão exclusão × soft delete × imutabilidade. | ✅ Elevado a 🔴; RN-SEG-04 detalhado; LGPD mínima movida p/ MVP |

---

## 4. Casos de borda / regras de negócio faltantes — APLICADOS

| # | Sev | Achado | Ação |
|---|---|---|---|
| E1 | 🟠 | Papel único + email único trava o **personal que também treina**. | ✅ RN-USR-08 (multi-papel / decisão) |
| E2 | 🟠 | **Streak sem timezone** definido. | ✅ RN-EXE-06 refinado + RN-INV-05 (fuso canônico) |
| E3 | 🟡 | **Atribuição duplicada** do mesmo plano ao mesmo aluno; reativação de vínculo sem unicidade. | ✅ RN-ATR-08 + RN-VIN-07 |
| E4 | 🟡 | **Desativação do profissional** com alunos ativos (cascata). | ✅ RN-VIN-08 |
| E5 | 🟡 | Conclusão automática a 100% × desmarcar (RN-EXE-04 × RN-EXE-02). | ✅ RN-EXE-10 (confirmação antes de tornar imutável) |
| E6 | 🟡 | "Ativo" sobrecarregado em 3 entidades; autorização leitura×escrita. | ✅ Glossário + RN-SEG-03 refinado |
| E7 | 🟡 | Sem **limites/quotas** (exercícios/planos/alunos). | ✅ RN-LIM-01 |
| E8 | 🟡 | CREF "válido" indefinido; sem unicidade. | ✅ RN-USR-05 detalhado |
| E9 | 🟡 | RN-01/EXE-05: conclusão hoje mistura flag `completed` mockada; impossível desmarcar pré-marcados. | ✅ Nota: conclusão deriva só de `ExerciseLog` |
| E10 | 🟡 | **Estados vazios/erro/carregamento** ausentes (aluno novo veria "24 treinos" mock). | ✅ RNF-11 + nota (componente `ui/empty.tsx` disponível) |

---

## 5. Plano de implementação — achados APLICADOS

| # | Sev | Achado | Ação |
|---|---|---|---|
| P1 | 🟠 | Vitest/RTL/Playwright/Prisma/Auth.js/email **não instalados**; plano os trata como "só ligar". | ✅ Marcados como "a instalar" |
| P2 | 🟠 | Fase 1 é **big-bang** (8 tabelas) sem fatia vertical; seed precisa de hash que só existe na Fase 2; Auth.js dita schema de usuário. | ✅ Auth+modelo de usuário juntos; fatia vertical fim-a-fim |
| P3 | 🟠 | **Recuperação de senha** exige provedor de e-mail transacional (custo/secret) não previsto. | ✅ Dependência explícita + alternativa p/ MVP |
| P4 | 🟠 | **Custos/limites** (Neon/Supabase free tier, pooling Prisma serverless) e **env/CI/observabilidade** ausentes. | ✅ Adicionados à Fase 0/1 |
| P5 | 🟠 | "MVP = Fases 0-4" exclui **LGPD mínima** e **e2e do happy path** — requisitos de lançamento no Brasil. | ✅ Movidos para dentro do MVP |
| P6 | ⚪ | "Decisão em aberto #3" (aluno multi-profissional) **já decidida** nas Regras (RN-VIN-03). | ✅ Removida |
| P7 | 🟡 | Branding `[NOME_DO_APP]` espalhado por 10+ arquivos; bloqueia metadata/manifest/SW. | ✅ Item zero da Fase 0 reforçado |

---

## 6. Débito consciente (não bloqueante para o MVP — registrado)

- **Monetização/billing** ausente; afeta contagem de "alunos ativos por academia" → reforça `gymId` (C2). *Decisão de produto pendente.*
- **Registro de carga/peso** (kg levantado, peso corporal, medidas) — dado mais útil de evolução — **fora do MVP** por ora; reavaliar.
- **Vídeo via embed YouTube**: dependência de terceiros, tracking (LGPD) e não funciona offline; definir fonte/fallback.
- **Sistema de status ✅/🟡/❌ achata risco**: "❌" não distingue *wiring* de *greenfield* (roster/perfil de aluno são greenfield = maior bloco do MVP). Adotada nota de esforço onde relevante.
- **Débito de remoção**: artefatos admin ainda no código (item Agenda na sidebar, footer "Admin/Gerente", abas de Academia/2FA/SMS em `/configuracoes`, botão "Agendar" em trainer-list) — listados no relatório.

---

## 7. Rastreabilidade

As correções foram aplicadas em:
- [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md) → v2.1
- [`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md) → v2.1
- [`REGRAS_DE_NEGOCIO.md`](./REGRAS_DE_NEGOCIO.md) → v1.1
