import "server-only"

import type { Role } from "@/lib/generated/prisma/enums"
import { auth } from "@/auth"
import { NotAuthenticatedError } from "@/lib/auth/errors"

/**
 * Contrato de sessão do servidor.
 *
 * Princípio não negociável (handoff §5): `gymId` é SEMPRE derivado da sessão,
 * nunca de input do cliente. Toda query de `lib/data/*` é escopada por ele.
 */
export interface SessionUser {
  userId: string
  gymId: string
  roles: Role[]
}

/**
 * Fonte da sessão atual: lê do Auth.js (`auth()`), mapeando roles/gymId do TOKEN
 * (jwt) — nunca de input do cliente. Retorna `null` se não houver sessão.
 */
async function getSession(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    userId: session.user.id,
    gymId: session.user.gymId,
    roles: session.user.roles,
  }
}

/**
 * Exige uma sessão autenticada. Lança `NotAuthenticatedError` se não houver —
 * a borda (Server Action / Route Handler / `proxy.ts`) traduz para redirect ao
 * login. NUNCA aceita identidade vinda do cliente.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new NotAuthenticatedError()
  }
  return session
}

/** Conveniências de papel (acúmulo de papéis — RN-USR-08). */
export function isProfissional(session: SessionUser): boolean {
  return session.roles.includes("profissional")
}

export function isAluno(session: SessionUser): boolean {
  return session.roles.includes("aluno")
}
