import "server-only"

import type { SessionUser } from "@/lib/auth/session"
import { NotFoundError } from "@/lib/auth/errors"

// Predicados de papel inline (puros) — evitam importar session.ts em runtime,
// que arrastaria o `@/auth` (next-auth) para contextos onde só queremos a lógica.
const isProfissional = (s: SessionUser) => s.roles.includes("profissional")
const isAluno = (s: SessionUser) => s.roles.includes("aluno")

/**
 * `assertCan` — a verificação de autorização fina (RBAC + tenant + posse).
 *
 * Roda DEPOIS de `requireSession()` e DEPOIS de re-buscar o recurso escopado por
 * `gymId` (anti-IDOR: nunca confiar em ids vindos do cliente sem reconferir).
 * Qualquer reprovação → `NotFoundError` (404), nunca 403 — ver errors.ts.
 *
 * Função PURA (não toca no banco) para ser unit-testável: quem chama passa o
 * recurso já carregado. Cobre o escopo da Fase 1 (WorkoutPlan); ações novas
 * (Assignment/Link/Log) entram por extensão nas fases seguintes.
 */

export type Action =
  | "workoutPlan:create"
  | "workoutPlan:read"
  | "workoutPlan:update"
  | "workoutPlan:delete"
  | "assignment:create"
  | "assignment:revoke"
  | "link:invite" // profissional cria convite (RN-VIN-02)
  | "link:accept" // aluno aceita convite — gym match (RN-VIN-09)
  | "workoutLog:update" // aluno atualiza o próprio log em_andamento (RN-EXE-02)

/** Recurso com dono e tenant (forma mínima exigida para autorizar). */
export interface OwnedResource {
  gymId: string
  /** dono/responsável: WorkoutPlan.createdBy ou Assignment.assignedBy. */
  createdBy: string
  /**
   * Apenas para `workoutPlan:read` por ALUNO (RN-ATR-04): há uma Assignment
   * `ativa` deste plano para o viewer? Computado na camada de dados (não-puro),
   * passado já resolvido para manter `assertCan` puro e testável.
   */
  viewerHasActiveAssignment?: boolean
}

/** Sobrecarga: `create`/`invite` não têm recurso preexistente (o alvo é o gym da sessão). */
export function assertCan(session: SessionUser, action: "workoutPlan:create"): void
export function assertCan(session: SessionUser, action: "link:invite"): void
export function assertCan(
  session: SessionUser,
  action: "workoutPlan:read" | "workoutPlan:update" | "workoutPlan:delete" | "assignment:create" | "assignment:revoke",
  resource: OwnedResource,
): void
export function assertCan(session: SessionUser, action: "link:accept", resource: OwnedResource): void
export function assertCan(session: SessionUser, action: "workoutLog:update", resource: OwnedResource): void
export function assertCan(
  session: SessionUser,
  action: Action,
  resource?: OwnedResource,
): void {
  switch (action) {
    case "workoutPlan:create": {
      // Só profissional cria planos (RN-PLA-01/02). O plano nasce no gym da
      // sessão e com createdBy = sessão — carimbado por quem chama, não pelo input.
      if (!isProfissional(session)) throw new NotFoundError()
      return
    }

    case "workoutPlan:read": {
      if (!resource) throw new NotFoundError()
      // 1) Tenant: recurso de outra academia é como se não existisse.
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      // 2a) Profissional dono lê o próprio plano.
      if (isProfissional(session) && resource.createdBy === session.userId) return
      // 2b) Aluno lê SOMENTE planos atribuídos a ele com atribuição ativa (RN-ATR-04).
      if (isAluno(session) && resource.viewerHasActiveAssignment) return
      // Qualquer outro caso (incl. profissional não-dono) → indistinguível de inexistente.
      throw new NotFoundError()
    }

    case "workoutPlan:update":
    case "workoutPlan:delete": {
      if (!resource) throw new NotFoundError()
      // 1) Tenant. 2) Papel + posse: gerir um plano exige ser o profissional dono.
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      if (!isProfissional(session)) throw new NotFoundError()
      if (resource.createdBy !== session.userId) throw new NotFoundError()
      return
    }

    case "assignment:create": {
      // RN-ATR-02: atribuir exige ser o profissional DONO do plano-alvo. O
      // `resource` aqui é o PLANO (gymId + createdBy). A validade do aluno-alvo
      // (mesmo gym, papel aluno) é checada por existência na camada de dados.
      // O gate de "vínculo ativo" (RN-VIN-06/Link) entra na Fase 3.
      if (!resource) throw new NotFoundError()
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      if (!isProfissional(session)) throw new NotFoundError()
      if (resource.createdBy !== session.userId) throw new NotFoundError()
      return
    }

    case "assignment:revoke": {
      // Revogar/pausar exige ser o profissional que FEZ a atribuição. `resource`
      // é a Assignment (gymId + createdBy=assignedBy).
      if (!resource) throw new NotFoundError()
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      if (!isProfissional(session)) throw new NotFoundError()
      if (resource.createdBy !== session.userId) throw new NotFoundError()
      return
    }

    case "link:invite": {
      // Só profissional gera convites (RN-VIN-02). Sem recurso preexistente.
      if (!isProfissional(session)) throw new NotFoundError()
      return
    }

    case "link:accept": {
      if (!resource) throw new NotFoundError()
      // Gym do aluno deve coincidir com o gym do link — anti-IDOR cross-tenant.
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      // Somente aluno aceita convite (profissional não se auto-vincula).
      if (!isAluno(session)) throw new NotFoundError()
      return
    }

    case "workoutLog:update": {
      if (!resource) throw new NotFoundError()
      if (resource.gymId !== session.gymId) throw new NotFoundError()
      // Somente aluno, e somente o dono do log (createdBy = alunoId do log).
      if (!isAluno(session)) throw new NotFoundError()
      if (resource.createdBy !== session.userId) throw new NotFoundError()
      return
    }

    default: {
      // Ação desconhecida: falha fechada.
      const _exhaustive: never = action
      throw new NotFoundError(`Ação não autorizada: ${String(_exhaustive)}`)
    }
  }
}
