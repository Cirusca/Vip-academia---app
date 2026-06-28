import "server-only"

import type { Role } from "@/lib/generated/prisma/enums"
import { auth } from "@/auth"
import { NotAuthenticatedError } from "@/lib/auth/errors"

export interface SessionUser {
  userId: string
  gymId: string
  roles: Role[]
  mustChangePassword: boolean
}

async function getSession(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    userId: session.user.id,
    gymId: session.user.gymId,
    roles: session.user.roles,
    mustChangePassword: session.user.mustChangePassword ?? false,
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new NotAuthenticatedError()
  }
  return session
}

export function isProfissional(session: SessionUser): boolean {
  return session.roles.includes("profissional")
}

export function isAluno(session: SessionUser): boolean {
  return session.roles.includes("aluno")
}
