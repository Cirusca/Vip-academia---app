# Revisão do Plano (Adversarial) + Bootstrap + Segurança

> **Data:** 28/06/2026  
> **Método:** workflow com 9 agentes — 7 adversariais (um por fase do plano,
> desafiando cada ponto), 1 de bootstrap (primeiros passos de construção) e 1 de
> revisão de segurança (estado atual + montagem dos próximos passos).  
> **Relacionados:** [`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md) · [`REGRAS_DE_NEGOCIO.md`](./REGRAS_DE_NEGOCIO.md) · [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md) · [`REVISAO_VALIDACAO.md`](./REVISAO_VALIDACAO.md)

Severidades: 🔴 Crítica · 🟠 Alta · 🟡 Média · ⚪ Baixa.

---

## Parte 1 — Revisão Adversarial por Fase

Veredito geral: o plano está **bem direcionado**, mas vários itens estão
**superdimensionados/mal-sequenciados** para um time pequeno e público low-mid.
Os ajustes de maior valor:

### Fase 0
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| 0.3 Server Components | 🟠 | Converter as 5 páginas para RSC **agora** (sem backend) é refator caro sem payoff; o `AppLayout` client puxa a árvore para client de qualquer forma. | Nesta fase, só criar a **fachada `lib/data/*`** + extrair folhas interativas. Adiar a conversão RSC para a Fase 1, **por fatia**. |
| 0.2 Tipos/mocks | 🟠 | O mock diverge do schema-alvo (`id` number, `completed` no Exercise, durações como string). Extrair "as-is" codifica o modelo errado. | `lib/types.ts` pelo **modelo-alvo** (Seção 6); mocks já obedecem aos tipos; ajustar componentes que leem `completed`. |
| 0.5 Poda | 🟡 | "Ocultar" deixa `app/agenda` no repo e ela quebra o build honesto (chama `AppLayout` sem `title`, TS2741). | **Remover** (deletar), não ocultar; rodar **antes** de 0.6. Adicionar remoção de `/personal` (trainer-list é admin). |
| 0.6 Testes | 🟡 | "Smoke por página" sobre UI mock que será reescrita = teste descartável. Remover `images.unoptimized` sem checar `next/image`. | ESLint + remover `ignoreBuildErrors` (núcleo). Testes **infra-only** + 1 trivial; smoke por página → Fase 1. Conferir uso de `next/image`. |
| 0.7 Infra | 🟡 | `.env.example` com "chave de e-mail" **contradiz** reset manual. Sentry agora (sem runtime) é prematuro. | `.env.example` só `DATABASE_URL`/`DIRECT_URL`/`AUTH_SECRET`. Sentry = **decisão** registrada; instalar na Fase 1. |

### Fase 1
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| 1.1 Pooling | 🟠 | "Accelerate/PgBouncer/driver" não são intercambiáveis; free-tier do Neon hiberna (cold start ruim no login). | Fixar **Neon + `@prisma/adapter-neon`** (HTTP, sem pool a esgotar) + `DIRECT_URL` p/ migrações. Registrar cold-start. |
| 1.3 Auth | 🟠 | Middleware roda no **Edge**; com adapter o default vira DB-session (não roda no edge). argon2 é nativo (não roda no edge). | **`session.strategy: 'jwt'`** (roles/gymId no token) p/ gate no middleware; authz fina nas Server Actions. Hash com **bcryptjs** (portável). Next 16: `middleware.ts` → **`proxy.ts`**. |
| 1.4 Reset manual | 🟠 | Subespecificado: não há admin no MVP; profissional só age sobre aluno **vinculado** (Link só existe na Fase 3). Como o aluno recebe a senha sem e-mail? | Na Fase 1, reset = operação de **seed/dev**. Reset-pelo-profissional → Fase 3/4. Add `mustChangePassword` ao User na 1.2. Senha temp **aleatória** (operador não escolhe), audit log, trocar no 1º login. |
| 1.2 Escopo schema | 🟡 | Incluir `Profile`/`Link` na 1ª migração contraria a fatia vertical (não são usados na 1.5). | Migração inicial = Auth.js + `User`(roles[],gymId,status,mustChangePassword) + `WorkoutPlan` + `Exercise`. **`Link`→Fase 3**, `Profile`→Fase 4. Colunas de **soft delete** já aqui. |
| 1.5 Aceite | 🟡 | Aceite não exige autorização por papel nem isolamento por `gymId` — que é o motivo da fatia. | Criação numa Server Action autorizada (papel=profissional, carimba gymId/createdBy da sessão); **teste negativo** (aluno/outro gym não cria/lê); plano com ≥1 Exercise ordenado + zod + RN-LIM. |

### Fase 2
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| 2.1 Fronteira | 🟠 | "Portar telas remanescentes" embute a **execução de treino** (snapshot/recuperação) que é núcleo da Fase 3 → sobreposição. `lib/data` ainda não existe. | 2.1 = só persistir `Assignment` + leitura de histórico/progresso. `WorkoutLog`/`ExerciseLog`+execução → **Fase 3.4**. Reescrever aceite ("telas de leitura", não "todas"). |
| 2.3 Migrações | 🟠 | Expand/contract + runbook de rollback é cerimônia de produção sobre dados de **teste** recriáveis por seed. | Adotar **já**: `prisma migrate deploy` no CI. **Adiar** expand/contract + rollback para o 1º deploy com dados reais. |
| 2.2 Soft delete | 🟡 | É propriedade de **schema** (nasce na Fase 1), não feature tardia. O que quebra é o **filtro padrão** (registro inativo vaza em busca RF-VIN-04 e na contagem de quota RN-LIM-01). | Colunas na Fase 1.2. Na Fase 2, **helper único** em `lib/data` que sempre filtra ativos + testes de que listas/buscas/quota excluem inativos. |

### Fase 3
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| 3.4 Execução | 🔴 | Concentra 5 mecanismos (snapshot + IndexedDB + recuperação + confirmação + vídeo); **`idb`/`dexie` não instalados**; Wi-Fi ruim na academia exige fila/retry/conflito (a parte mais difícil); flag `completed` mock ainda quebra `getProgress`. | **Quebrar** em sub-itens. MVP: snapshot + confirmação + render do embed real + recuperação. Adotar **`idb`**; simplificar a *last-write-wins* (ou localStorage). **Pré-requisito:** remover `completed` do mock; `getProgress` deriva só de `ExerciseLog`. |
| 3.1 Onboarding | 🟠 | Autodeclarado "pré-requisito" mas depende de Auth (Fase 1) e `Link` migrado; é **greenfield** total (não há tela/entidade de aluno). | Tornar dependência explícita; separar emissão do convite × aceite/onboarding; definir token assinado vs código (expiração/uso único) — afeta o schema do `Link`. |
| 3.6 Fuso | 🟡 | `date-fns-tz` **não instalado**; streak comparando dias-calendário com UTC/DST = bug off-by-one clássico. | Helper de fuso compartilhado (Fase 2); guardar UTC, derivar "dia" no fuso; **teste de borda** (virada 23h-01h, dia pulado). |
| 3.2 CRUD | 🟡 | `order` de exercício **não existe** no mock (ordem = posição no array); borda de RN-LIM (criar o 31º) não especificada. | Campo `order` explícito + id global; resposta de borda dos limites (422 zod); reordenação por setas (mais barata) no MVP. |
| 3.3 Atribuição | ⚪ | Ok. Unicidade "no-op ou reativa" é ambígua. | **Índice único parcial** no Postgres `UNIQUE(workoutPlanId,alunoId) WHERE status='ativa'` + upsert idempotente. |

### Fase 4
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| 4.1 Roster | 🟠 | `/personal` (trainer-list) é **gestão de equipe (admin, fora do MVP)**, não roster aluno↔profissional. Pior: a **Fase 3.3 já precisa** do roster para escolher o aluno. | Mover "listar meus alunos ativos + selecionar p/ atribuir" para **dentro da Fase 3**. Marcar 4.1 como greenfield; filtrar por `Link.status=ativo`+`professionalId`+`gymId`. |
| 4.3 Reverif. e-mail | 🟠 | **Contradiz** "sem e-mail no MVP" (1.4): reverificação exige envio de e-mail. Tema no banco duplica/colide com 0.4 (next-themes/localStorage). | **Adiar troca de e-mail** pós-MVP (e-mail imutável/por reset manual). Tema = localStorage (0.4); banco só pós-MVP. "Trocar senha" = self-service (senha atual) coexistindo com reset manual. |
| 4.2 Visão aluno | 🟡 | Mistura "aluno vê profissional" (trivial) com "cadastro de profissional" (onboarding/auth, Fase 1). CREF (RN-USR-05) embutido sem citar. | Manter (i) "aluno vê profissional" na Fase 4; mover (ii) cadastro/CREF do profissional p/ **Fase 1** (pré-requisito de 1.5). |
| 4.5 Cascata | 🟠 | `RN-VIN-08` (desativar profissional) **não tem gatilho** no MVP (sem admin); exige transação multi-tabela + "notificar" (notificação fora do MVP). | Manter no MVP só `RN-ATR-07` (pausar+read-only) e `RN-VIN-07` (reativar). Cascata → **débito**/procedimento manual + constraint. "Aviso ao abrir o app" (pull), não push. |

### Fase 4.5 (pré-lançamento, dentro do MVP)
| Ponto | Sev | Problema | Ajuste |
|---|---|---|---|
| PL.1 Controlador×Operador | 🟠 | Rotular o fornecedor "operador" é **juridicamente frágil**: quem decide finalidades/retenção/modelo é **controlador** (ou conjunto). Contrato não muda o papel perante a ANPD. | Assumir fornecedor como **controlador** (ou conjunto). Definir canal de requisição do titular + SLA 15 dias com **dono operacional**. |
| PL.1 Anonimização | 🟠 | "Anonimizar logs" não é checkbox: `date`+`durationMin`+`snapshot`+Gym podem **reidentificar**; colide com integridade e com RN-SEG-03. | Preferir **HARD DELETE** em cascata dos logs do titular, preservando só **agregados** desvinculados. Decidir na **Fase 2** (schema/cascade). |
| PL.1 Consentimento | 🟡 | Consentimento de dado sensível (art. 11) não é checkbox; e o `User`(aluno) é criado pelo profissional **antes** do aceite → PII tratada sem base legal. | Coletar consentimento **no aceite** (RN-VIN-09), registrado (timestamp/versão/IP); base legal p/ o "pendente". Sequenciar junto da Fase 3.1. |
| PL.2 e2e | 🟠 | e2e do happy path **no fim** deixa Fases 1-4 sem rede; Playwright não instalado; falta DB efêmero/seed. | Mover **infra de e2e** p/ Fase 0.7/1; construir o spec **incrementalmente** por fatia. |
| PL.2 Autz negativa | 🟠 | Happy path verde pode passar com aluno vendo dados de outro `gymId`/aluno (pior incidente possível). | Incluir **≥1 teste negativo** de autorização (cross-tenant/cross-aluno → 404) **dentro do MVP**. |

### Fase 5
- Mover os **testes de autorização/segurança** para dentro do MVP (coberto pelo teste negativo de PL.2 acima); o resto do unhappy path fica na Fase 5.

---

## Parte 2 — Roteiro de Bootstrap (primeiros passos)

Sequência executável para sair do protótipo e chegar à 1ª fatia vertical
(profissional autenticado cria um treino persistido). Comandos concretos.

> ⚠️ **Armadilhas-chave (ler antes):**
> 1. **`.gitignore` vaza segredo:** hoje ignora só `.env*.local`, **não `.env`**. Adicionar `.env` ao `.gitignore` **antes** de escrever segredos.
> 2. **Next 16: `middleware.ts` → `proxy.ts`** (export `proxy`).
> 3. **Auth.js v5** = `next-auth@beta` + `@auth/prisma-adapter`; **`session.strategy:'jwt'`** (adapter default seria DB-session, não roda no edge); `AUTH_SECRET` via `npx auth secret`.
> 4. **Auth antes do seed:** modelar tabelas do Auth.js **junto** do núcleo na 1ª migração; seed (bcrypt) só depois do `passwordHash` existir.
> 5. **Pooling:** Neon dá string POOLED (`-pooler`)→`DATABASE_URL` e DIRECT→`DIRECT_URL` (migrações). Usar `@prisma/adapter-neon` + singleton `lib/prisma.ts`.
> 6. **Remover `ignoreBuildErrors` por ÚLTIMO**, depois de lint/tsc prontos e erros corrigidos.
> 7. **`gymId` desde o início** em toda entidade e em toda query de `lib/data`.

| # | Passo | Essência | Comandos-chave |
|---|---|---|---|
| 1 | Pré-flight | Branch + baseline (não remover `ignoreBuildErrors` ainda) | `git checkout -b feat/fase-0-fundacao` · `pnpm install` · `pnpm build` |
| 2 | Remover next-pwa | Tira o wrapper `withPWA` do `next.config.mjs`; mantém manifest | `pnpm remove next-pwa` |
| 3 | Branding + tema + poda | Nome único; montar `<ThemeProvider>` no layout; **deletar** `/agenda`, footer Admin, abas academia/2FA/SMS, `/personal` | `rm -rf app/agenda` |
| 4 | Extrair tipos/mocks | `lib/types.ts` (modelo-alvo) + `lib/mock-data/*` + fachada `lib/data/*` | `mkdir -p lib/mock-data lib/data` |
| 5 | Reduzir `use client` | Páginas viram Server Components que chamam `lib/data/*`; client só nas folhas | (por fatia, começar por `/treinos`) |
| 6 | ESLint + Vitest | Instalar (hoje ausentes); ainda com `ignoreBuildErrors` ligado | `pnpm add -D eslint eslint-config-next vitest @testing-library/react jsdom` |
| 7 | Infra/Postgres (Neon) | `.env` no `.gitignore`; `DATABASE_URL`(pooled)+`DIRECT_URL`; `AUTH_SECRET` | `printf '\n.env\n' >> .gitignore` · `npx auth secret` |
| 8 | Prisma + Auth.js v5 | Instalar Prisma + adapter Neon + next-auth@beta + bcryptjs | `pnpm add @prisma/client @prisma/adapter-neon @neondatabase/serverless next-auth@beta @auth/prisma-adapter bcryptjs` |
| 9 | Schema + 1ª migração | Auth.js + `User`(gymId,roles,status,mustChangePassword) + `WorkoutPlan`+`Exercise` | `pnpm dlx prisma migrate dev --name init_auth_and_core` |
| 10 | Auth (proxy + login) | `auth.ts` (JWT, Credentials/bcrypt); `proxy.ts`; `/login`; ligar "Sair" | criar `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `proxy.ts` |
| 11 | Seed + 1ª fatia | Seed com hash (depois do auth); Server Action cria `WorkoutPlan` persistido por sessão | `pnpm dlx prisma db seed` |
| 12 | Build honesto + CI | **Agora** remover `ignoreBuildErrors`/`images.unoptimized`; CI lint+build+test | `pnpm lint && pnpm test:run && pnpm build` |

Fontes (jun/2026): authjs.dev (adapter Prisma, migração v5), prisma.io/docs (Auth.js, Neon), neon.com/docs (Prisma).

---

## Parte 3 — Revisão de Segurança

### Estado atual ("feito") — aceitável para protótipo, com 1 gap a corrigir já
| Área | Sev | Achado |
|---|---|---|
| Secrets | ⚪→🟠 | Repo limpo (sem segredos). **Mas `.gitignore` cobre só `.env*.local`, não `.env`** — corrigir antes de criar `.env`. |
| Build/Config | 🟡 | `typescript.ignoreBuildErrors:true` (mascara bugs com `strict`) + sem ESLint configurado. Tornar build/lint verdes **sem flags** antes de auth. |
| Auth | 🟡 | Inexistente por design (usuário fixo, "Sair" sem handler, rotas públicas). Bloqueio de pré-produção: nenhum dado real antes do Auth.js. |
| Headers/CSP | ⚪ | Sem CSP — relevante ao renderizar o embed YouTube (usar `youtube-nocookie.com`, `frame-ancestors`). |
| Analytics | ⚪ | Vercel Analytics gated a produção; inventariar na LGPD. |

### Montagem dos próximos passos — os 3 riscos críticos
| Área | Sev | Risco | Mitigação |
|---|---|---|---|
| **Multi-tenant `gymId`** | 🔴 | Vazamento **cross-academia** se `gymId` for só um campo "que o dev lembra de filtrar" — uma query esquecida = vazamento. | Derivar `gymId` **da sessão** (nunca do cliente); `lib/data/*` injeta `where:{gymId}` obrigatório (não expor Prisma cru); avaliar **RLS** no Postgres; e2e cross-tenant. |
| **RBAC/Autorização** | 🔴 | Server Actions são **endpoints públicos**; ocultar botão na UI não autoriza. Aluno chamaria a mutation de atribuir/editar direto. | Em cada action: `auth()` → `assertCan(papel/vínculo/posse)` → `zod.parse` → query escopada. Nunca confiar em props do cliente. |
| **IDOR** | 🔴 | Passar `workoutPlanId`/`alunoId`/`workoutLogId` arbitrário p/ agir sobre recurso de outro. | Re-buscar o recurso **escopado por gymId+posse** antes de agir; **404** ao falhar (não 403). Unicidade (RN-ATR-08) por **constraint no banco**. |

### Outros (próximos passos) — alta
- **Reset manual = risco de account takeover** pelo operador: senha temp **aleatória** (não escolhida/visível), `mustChangePassword`, **audit log**, notificar o aluno. Documentar na LGPD.
- **Secrets/Auth.js:** `AUTH_SECRET` forte por ambiente; nunca commitar `.env`; jamais prefixar segredo com `NEXT_PUBLIC_`.
- **Server Actions:** nunca retornar entidade crua do Prisma (vaza `passwordHash`) — selecionar campos.
- **Persistência client-side (IndexedDB):** em dispositivo compartilhado (recepção), **escopar por `userId` e limpar no logout**; guardar o mínimo (ids/snapshot, não nome/e-mail).
- **LGPD:** consentimento granular no aceite, exclusão (hard delete de logs), `youtube-nocookie.com`. Tratar PL.1 como requisito de lançamento.
- **Validação:** zod **no servidor** (a do client é UX); unicidade (email/CREF/atribuição) por constraint no banco.

> **Resumo de segurança:** o protótipo está limpo para o que é (sem segredos, sem
> backend). Os riscos reais nascem na montagem: a tríade **gymId / RBAC / IDOR** é
> 🔴 e deve ser arquitetada desde a Fase 1 (autorização **no servidor**, `gymId`
> da sessão, helper central de acesso a dados), não retrofitada.
