# Regras de Negócio — `[NOME_DO_APP]` (App de Treino)

> **Versão:** 1.1 (incorpora achados de validação/revisão adversarial)  
> **Data:** 27/06/2026  
> **Escopo:** MVP — app de treino **B2B2C** (profissional + aluno), academias **low-mid**  
> **Documentos relacionados:** [`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md) · [`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md) · [`REVISAO_VALIDACAO.md`](./REVISAO_VALIDACAO.md)

> **Glossário do estado "ativo"** (o termo é usado em entidades distintas):
> **vínculo `ativo`** (`Link`) = relação profissional↔aluno em vigor · **atribuição
> `ativa`** (`Assignment`) = plano que aparece como treino do dia do aluno ·
> **usuário/profissional `ativo`** = conta não desativada (soft delete). Regras de
> autorização (RN-SEG) referenciam o **vínculo** salvo indicação contrária.

Este documento detalha as **regras de negócio** que governam o comportamento do
sistema. Cada regra é **testável** e tem um identificador estável (`RN-<domínio>-<n>`).
As decisões de produto que estavam pendentes foram **confirmadas em 27/06/2026**
e estão consolidadas na Seção 9; as regras abaixo já refletem essas decisões.

**Legenda de status:** ✅ já refletido na UI (mock) · 🟡 parcial · ❌ a implementar.

---

## 1. Usuários, Papéis e Acesso (RN-USR)

| ID | Regra | Status |
|---|---|---|
| RN-USR-01 | Todo usuário tem ao menos um papel entre `profissional` e `aluno` (ver RN-USR-08 sobre acúmulo). A UI opera com um **papel ativo por sessão**. | ❌ |
| RN-USR-02 | O **email** é único no sistema e serve como identificador de login. | ❌ |
| RN-USR-03 | Acesso a qualquer funcionalidade exige **autenticação**; não há área pública além de login/cadastro/recuperação de senha. | ❌ |
| RN-USR-04 | A **senha** deve ter no mínimo 8 caracteres, com ao menos 1 letra e 1 número; é armazenada apenas como *hash* (nunca em texto puro). | ❌ |
| RN-USR-05 | Um **profissional** só é ativado com **CREF** informado. No MVP valida-se o **formato** (UF + número) e a **unicidade** entre profissionais ativos; a verificação no Confef fica como débito conhecido, com disclaimer de responsabilidade do profissional. | 🟡 (campo existe no form, sem validação) |
| RN-USR-06 | A interface (menu e ações) é renderizada conforme o papel: o aluno não vê ferramentas de criação/atribuição; o profissional não vê a si mesmo como "aluno". | ❌ |
| RN-USR-07 | Cada usuário só acessa **os próprios dados** e os dados a que está vinculado (ver RN-SEG). | ❌ |
| RN-USR-08 | **Acúmulo de papéis:** um usuário pode ter mais de um papel (modelado como `roles[]`), permitindo que um profissional também seja aluno de outro profissional. O email continua único por **pessoa** (não por papel). | ❌ |

---

## 2. Vínculo Profissional ↔ Aluno (RN-VIN)

| ID | Regra | Status |
|---|---|---|
| RN-VIN-01 | O vínculo entre profissional e aluno é representado por `Link { professionalId, alunoId, status }`. | ❌ |
| RN-VIN-02 | O **profissional** inicia o vínculo adicionando/convidando um aluno; o vínculo nasce com status `pendente` e passa a `ativo` após aceite do aluno. | ❌ |
| RN-VIN-03 | **No MVP, um aluno tem no máximo 1 profissional `ativo` por vez.** O modelo permite múltiplos vínculos historicamente, mas apenas um ativo. | ❌ |
| RN-VIN-04 | Um **profissional** pode ter **N alunos** vinculados (sem limite técnico no MVP). | ❌ |
| RN-VIN-05 | Qualquer das partes pode **encerrar** o vínculo, que passa a status `inativo`; o histórico de treinos do aluno é preservado (ver efeito nas atribuições em RN-ATR-07). | ❌ |
| RN-VIN-06 | Um profissional só pode **atribuir treinos** de alunos com vínculo `ativo` (ver RN-ATR e RN-SEG). | ❌ |
| RN-VIN-07 | **Reativação:** reativar um vínculo `inativo` gera uma nova transição de status no **mesmo** `Link` (não cria duplicata), preservando a unicidade do par (`professionalId`, `alunoId`). | ❌ |
| RN-VIN-08 | **Desativação do profissional com alunos ativos:** ao desativar (soft delete) um profissional, todos os seus vínculos passam a `inativo` e as atribuições a `pausada` (RN-ATR-07); os alunos são notificados e mantêm acesso somente-leitura ao histórico. Planos dele sofrem soft delete, mas permanecem referenciáveis por `WorkoutLog` passados (RN-INV-01/03). | ❌ |
| RN-VIN-09 | **Onboarding / aluno sem vínculo:** o vínculo nasce de um **convite** (link/código emitido pelo profissional) e só vira `ativo` após **aceite** do aluno. Enquanto o aluno não tiver vínculo `ativo`, o app exibe uma tela de onboarding (inserir código / aceitar convite pendente), e **não** mostra treinos de terceiros (ver RN-ATR-04 e estados vazios RNF-11). | ❌ |

---

## 3. Planos de Treino (RN-PLA)

| ID | Regra | Status |
|---|---|---|
| RN-PLA-01 | Um **plano de treino** é criado por um **profissional**, que é seu **dono** (`createdBy`). | 🟡 (planos existem como mock) |
| RN-PLA-02 | Apenas o **dono** do plano pode editá-lo ou excluí-lo. | ❌ |
| RN-PLA-03 | Um plano válido tem **nome** e **ao menos 1 exercício**. | ❌ |
| RN-PLA-04 | Cada **exercício** tem: nome, nº de séries (`sets` ≥ 1), faixa de repetições (`reps`), descanso (`rest`), grupo muscular (`muscle`), e opcionalmente vídeo (`videoUrl`) e instruções. | ✅ (estrutura no mock) |
| RN-PLA-05 | A ordem dos exercícios dentro do plano é significativa (`order`) e definida pelo profissional. | ❌ |
| RN-PLA-06 | O **nível** do plano é um de: `iniciante`, `intermediário`, `avançado`. | ✅ (presente no mock `components/dashboard/workout-list.tsx`) |
| RN-PLA-07 | Duração e calorias do plano são **estimativas** exibidas como faixa (ex.: "45-50 min", "320-400 kcal"); não são valores medidos. | ✅ (mock) |
| RN-PLA-08 | Excluir um plano **não** apaga os registros históricos de execução (`WorkoutLog`) já realizados a partir dele (ver RN-EXE-07). | ❌ |

---

## 4. Atribuição de Treinos (RN-ATR)

| ID | Regra | Status |
|---|---|---|
| RN-ATR-01 | A atribuição é representada por `Assignment { workoutPlanId, alunoId, assignedBy, status, assignedAt }`. | ❌ |
| RN-ATR-02 | Um profissional só pode atribuir um plano que **lhe pertence** a alunos com vínculo **`ativo`**. | ❌ |
| RN-ATR-03 | Um mesmo plano pode ser atribuído a **vários alunos**; um aluno pode ter **vários planos** atribuídos (ex.: Treino A, B, C). | 🟡 (UI mostra A/B/C) |
| RN-ATR-04 | O **aluno só enxerga planos atribuídos a ele**; nunca a biblioteca completa do profissional. | ❌ |
| RN-ATR-05 | Uma atribuição tem status `ativa`, `pausada` ou `concluída`. Apenas atribuições `ativas` aparecem como treinos do dia para o aluno. | ❌ |
| RN-ATR-06 | A atribuição **referencia** o plano (não copia). Edições do profissional no plano **refletem** nas atribuições `ativas`. Registros já executados permanecem imutáveis (RN-EXE-07). | ❌ |
| RN-ATR-07 | Encerrar o vínculo (RN-VIN-05) passa as atribuições `ativas` daquele par para **`pausada`** (estado único, reversível). O aluno mantém acesso **somente-leitura** ao histórico e aos planos pausados (não inicia novos `WorkoutLog`), com aviso "vínculo encerrado". Atribuições pausadas por encerramento só voltam a `ativa` via novo vínculo + reatribuição. | ❌ |
| RN-ATR-08 | **Unicidade:** não pode existir mais de uma `Assignment` `ativa` para o mesmo par (`workoutPlanId`, `alunoId`). Reatribuir um plano já ativo é *no-op* (ou reativa a atribuição existente), evitando treinos duplicados na lista do aluno. | ❌ |

---

## 5. Execução de Treino e Progresso (RN-EXE)

| ID | Regra | Status |
|---|---|---|
| RN-EXE-01 | Ao "**Iniciar Treino**", o sistema cria um `WorkoutLog { alunoId, workoutPlanId, date, durationMin, caloriesBurned }`. | 🟡 (botão sem ação) |
| RN-EXE-02 | Durante a execução, o aluno **marca/desmarca** cada exercício como concluído, gerando/atualizando `ExerciseLog { completed }`. A conclusão deriva **exclusivamente** do `ExerciseLog` — não de flags pré-marcadas no plano (o mock atual usa `completed: true`, que será removido). | 🟡 (hoje só estado de sessão; mistura flag do mock) |
| RN-EXE-03 | O **progresso de um treino** = `round(exercícios concluídos / total de exercícios × 100)`, calculado sobre o **snapshot** do `WorkoutLog` (RN-EXE-09). | ✅ fórmula (`workout-details.tsx:374`) |
| RN-EXE-04 | Um treino é considerado **concluído** quando o aluno o finaliza explicitamente (botão "Concluir") **ou** quando 100% dos exercícios estão marcados. | ❌ |
| RN-EXE-05 | As **métricas de Progresso** (total de treinos, calorias acumuladas, tempo total) são derivadas dos `WorkoutLog`/`ExerciseLog` do aluno — nunca digitadas manualmente. | 🟡 (UI mock) |
| RN-EXE-06 | A **sequência (streak)** conta **dias-calendário consecutivos** (no fuso de RN-INV-05) com ao menos um treino `concluído`; pular um dia-calendário zera. O dia corrente conta como pendente até que haja um treino concluído nele. | ❌ |
| RN-EXE-07 | O **histórico** (`WorkoutLog`/`ExerciseLog`) é **imutável** após a conclusão do treino: edições posteriores no plano não alteram registros passados. | ❌ |
| RN-EXE-08 | O **profissional** acompanha o progresso apenas dos **seus** alunos com vínculo ativo, conforme RN-SEG-03 (leitura). | ❌ |
| RN-EXE-09 | **Snapshot ao iniciar:** ao "Iniciar Treino", o `WorkoutLog` **congela** a lista de exercícios do plano naquele instante. Edições do profissional (RN-ATR-06) só afetam execuções iniciadas **depois**; sessões abertas seguem com o snapshot. Reconcilia RN-ATR-06 (propaga p/ futuras) com RN-EXE-07 (imutabilidade do que está em curso). | ❌ |
| RN-EXE-10 | **Confirmação de conclusão:** ao atingir 100% (ou pelo botão "Concluir"), o sistema **pede confirmação** antes de fechar o `WorkoutLog`. Antes de confirmar, marcar/desmarcar é livre; **após** confirmado, o treino é imutável (RN-EXE-07) e conta para métricas/streak. | ❌ |
| RN-EXE-11 | **Sessão interrompida:** o `WorkoutLog` tem ciclo de vida `em_andamento` → `concluído`; o progresso é persistido **incrementalmente** por exercício, de modo que reabrir o app após fechar/cair a conexão **recupera** o treino em andamento sem perda. | ❌ |

---

## 6. Perfil e Preferências (RN-CFG)

| ID | Regra | Status |
|---|---|---|
| RN-CFG-01 | O usuário pode editar nome, telefone e foto; o **email** só muda mediante reverificação. | 🟡 (form sem submissão) |
| RN-CFG-02 | A troca de senha exige a **senha atual** e a nova senha deve respeitar RN-USR-04. | 🟡 |
| RN-CFG-03 | A preferência de **tema** (claro/escuro) é persistida por usuário e aplicada no carregamento. | ❌ |
| RN-CFG-04 | O idioma do MVP é fixo em **pt-BR**. | ✅ |

---

## 7. Segurança e Isolamento de Dados (RN-SEG)

| ID | Regra | Status |
|---|---|---|
| RN-SEG-01 | Toda requisição a dados é autorizada no **servidor** conforme papel e vínculo (não confiar na ocultação de UI). | ❌ |
| RN-SEG-02 | Um **aluno** nunca acessa dados de outro aluno. | ❌ |
| RN-SEG-03 | Autorização por operação: **escrita** (atribuir/editar) exige vínculo **`ativo`**; **leitura** do histórico que o próprio profissional gerou pode persistir após o encerramento do vínculo, salvo exclusão LGPD do aluno (RN-SEG-04). | ❌ |
| RN-SEG-04 | **LGPD:** dados de treino/biometria são tratados como **potencialmente sensíveis** (base legal/consentimento específico no cadastro). Na **exclusão** (art. 18), os dados pessoais identificáveis (nome, email, telefone, foto, CREF) são **apagados de fato**; `WorkoutLog`/`ExerciseLog` são **anonimizados** (desvinculados do `userId`, mantendo só agregados). Prazo de atendimento: até 15 dias. Define-se controlador (academia) × operador (fornecedor) em contrato. | ❌ |

---

## 8. Invariantes Transversais (RN-INV)

| ID | Regra |
|---|---|
| RN-INV-01 | Integridade referencial: `Exercise`→`WorkoutPlan`, `Assignment`→(`WorkoutPlan`,`User`), `ExerciseLog`→`WorkoutLog` devem sempre apontar para registros existentes. |
| RN-INV-02 | Datas de execução não podem ser **futuras** em relação ao fuso de RN-INV-05. |
| RN-INV-03 | Exclusões de entidades com histórico usam **soft delete** (marcação `inativo`) para preservar `WorkoutLog`/`ExerciseLog`. *(Exceção: a exclusão LGPD de PII em RN-SEG-04 é definitiva, com anonimização dos registros.)* |
| RN-INV-04 | Valores numéricos de treino são não-negativos (`sets ≥ 1`, `durationMin ≥ 0`, `caloriesBurned ≥ 0`). |
| RN-INV-05 | O **fuso canônico** para "dia", streak (RN-EXE-06) e "treino do dia" é `America/Sao_Paulo` no MVP (evolução: fuso do perfil do aluno). A data de um `WorkoutLog` é a **data local** de conclusão nesse fuso. |

### 8.1. Limites e Quotas (RN-LIM)

| ID | Regra |
|---|---|
| RN-LIM-01 | Limites sãos validados no servidor no MVP: ≤ **30 exercícios** por plano, ≤ **50 planos** por profissional, `sets` e `reps` dentro de faixas plausíveis. Evita entradas absurdas que quebram estimativas (RN-PLA-07) e o cálculo de progresso. Valores são generosos e revisáveis. |

---

## 9. Decisões Confirmadas

As decisões de produto abaixo foram **aprovadas em bloco em 27/06/2026** e já
estão incorporadas às regras das seções anteriores:

| # | Regra | Pergunta | Decisão confirmada |
|---|---|---|---|
| 1 | RN-VIN-02 | O vínculo é por **convite com aceite** do aluno, ou o profissional adiciona direto? | ✔ Convite com aceite (mais aderente à LGPD) |
| 2 | RN-VIN-03 | Um aluno pode ter **mais de um** profissional ativo? | ✔ Não no MVP (1 ativo); modelo permite N |
| 3 | RN-ATR-06 | Editar um plano **propaga** para atribuições ativas ou cria nova versão? | ✔ Propaga; histórico permanece imutável |
| 4 | RN-EXE-04 | Treino conclui **automaticamente** a 100% ou só por ação do aluno? | ✔ Ambos (100% **ou** botão) |
| 5 | RN-EXE-06 | Como definir a **sequência (streak)** — por dia, por treino atribuído? | ✔ Dias consecutivos com ≥1 treino concluído |
| 6 | RN-CFG-01 | Troca de email exige **reverificação**? | ✔ Sim |
| 7 | RN-INV-03 | Usar **soft delete** em todas as entidades com histórico? | ✔ Sim |

---

## 10. Rastreabilidade

Estas regras detalham e substituem o resumo da Seção 5 do
[`RELATORIO_DE_REQUISITOS.md`](./RELATORIO_DE_REQUISITOS.md) e dão base aos
critérios de aceite das fases do [`PLANO_DE_IMPLEMENTACAO.md`](./PLANO_DE_IMPLEMENTACAO.md):

- **Fase 1** (auth/papéis/fatia vertical) → RN-USR, RN-SEG-01/02/03, RN-LIM
- **Fase 2** (resto da persistência) → RN-INV-03 (soft delete), RN-PLA-08
- **Fase 3** (núcleo + onboarding) → RN-VIN-09, RN-PLA, RN-ATR, RN-EXE, RN-INV-05
- **Fase 4** (vínculo/perfil) → RN-VIN (incl. 07/08), RN-CFG
- **Fase 4.5** (pré-lançamento) → RN-SEG-04 (LGPD)
