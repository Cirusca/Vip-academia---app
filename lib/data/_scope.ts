import "server-only"

import { prisma } from "@/lib/prisma"
import type { SessionUser } from "@/lib/auth/session"

/**
 * Ponto único de acesso ao Prisma DENTRO de `lib/data/*`.
 *
 * Regra de ouro do multi-tenant (riscos 🔴 da revisão de segurança): nenhum
 * módulo fora de `lib/data/*` importa o `prisma` cru, e toda query que toca uma
 * tabela com `gymId` passa o filtro por `tenantWhere(session, ...)` — assim o
 * isolamento por academia não depende de "o dev lembrar de filtrar".
 */
export { prisma as db }

/**
 * Injeta `gymId` da SESSÃO num `where`, de forma não sobrescrevível: mesmo que o
 * chamador (ou um input malicioso) passe `gymId`, o valor da sessão prevalece —
 * `gymId` nunca vem do cliente (handoff §5 / RN-SEG).
 */
export function tenantWhere<T extends Record<string, unknown>>(
  session: SessionUser,
  where?: T,
): T & { gymId: string } {
  return { ...(where ?? ({} as T)), gymId: session.gymId }
}
