import "server-only"

import type { Role } from "@/lib/generated/prisma/enums"
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
 * Fonte da sessão atual. Hoje é um *placeholder* (Auth.js entra no item 4 do
 * plano). Quando o Auth.js estiver montado, este corpo passa a:
 *
 *   const session = await auth()
 *   if (!session?.user) return null
 *   return { userId, gymId, roles } // tudo lido do TOKEN (jwt), não do cliente
 *
 * Até lá retorna `null` (ninguém autenticado) — falha fechada, sem brecha.
 */
async function getSession(): Promise<SessionUser | null> {
  // TODO(item 4 — Auth.js v5): ler de `auth()` e mapear roles/gymId do token.
  return null
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
