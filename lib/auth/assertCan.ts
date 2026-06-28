import "server-only"

import type { SessionUser } from "@/lib/auth/session"
import { NotFoundError } from "@/lib/auth/errors"

// Predicado de papel inline (puro) — evita importar session.ts em runtime, que
// arrastaria o `@/auth` (next-auth) para contextos onde só queremos a lógica.
const isProfissional = (s: SessionUser) => s.roles.includes("profissional")

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

/** Recurso com dono e tenant (forma mínima exigida para autorizar). */
export interface OwnedResource {
  gymId: string
  /** dono = profissional que criou (WorkoutPlan.createdBy). */
  createdBy: string
}

/** Sobrecarga: `create` não tem recurso preexistente (o alvo é o gym da sessão). */
export function assertCan(session: SessionUser, action: "workoutPlan:create"): void
export function assertCan(
  session: SessionUser,
  action: "workoutPlan:read" | "workoutPlan:update" | "workoutPlan:delete",
  resource: OwnedResource,
): void
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

    case "workoutPlan:read":
    case "workoutPlan:update":
    case "workoutPlan:delete": {
      // resource é garantido pela sobrecarga tipada; defesa em runtime mesmo assim.
      if (!resource) throw new NotFoundError()

      // 1) Tenant: recurso de outra academia é como se não existisse (cross-tenant).
      if (resource.gymId !== session.gymId) throw new NotFoundError()

      // 2) Papel + posse: no MVP, gerir um plano exige ser o profissional dono.
      //    (Leitura por aluno via Assignment entra na Fase 2 — por ora, 404.)
      if (!isProfissional(session)) throw new NotFoundError()
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
