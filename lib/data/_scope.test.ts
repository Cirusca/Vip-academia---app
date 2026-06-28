import { describe, it, expect, vi } from "vitest"

// `_scope` re-exporta o client do Prisma; mockamos para não construir adapter/pool.
vi.mock("@/lib/prisma", () => ({ prisma: {} }))

import { tenantWhere } from "@/lib/data/_scope"
import type { SessionUser } from "@/lib/auth/session"

const session: SessionUser = { userId: "u1", gymId: "gym-1", roles: ["profissional"] }

describe("tenantWhere", () => {
  it("injeta gymId da sessão quando não há where", () => {
    expect(tenantWhere(session)).toEqual({ gymId: "gym-1" })
  })

  it("preserva filtros do chamador e adiciona gymId", () => {
    expect(tenantWhere(session, { status: "ativo" })).toEqual({
      status: "ativo",
      gymId: "gym-1",
    })
  })

  it("gymId da sessão NÃO é sobrescrevível por input", () => {
    // Mesmo que o chamador tente forçar outro tenant, a sessão prevalece.
    const where = { gymId: "gym-ATACANTE" } as Record<string, unknown>
    expect(tenantWhere(session, where).gymId).toBe("gym-1")
  })
})
