import { describe, it, expect } from "vitest"
import { assertCan, type OwnedResource } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const prof: SessionUser = { userId: "u-prof", gymId: "gym-1", roles: ["profissional"], mustChangePassword: false }
const aluno: SessionUser = { userId: "u-aluno", gymId: "gym-1", roles: ["aluno"], mustChangePassword: false }

const ownPlan: OwnedResource = { gymId: "gym-1", createdBy: "u-prof" }

describe("assertCan — workoutPlan:create", () => {
  it("permite profissional", () => {
    expect(() => assertCan(prof, "workoutPlan:create")).not.toThrow()
  })

  it("bloqueia aluno (404, anti-IDOR)", () => {
    expect(() => assertCan(aluno, "workoutPlan:create")).toThrow(NotFoundError)
  })
})

describe("assertCan — read/update/delete de plano", () => {
  for (const action of [
    "workoutPlan:read",
    "workoutPlan:update",
    "workoutPlan:delete",
  ] as const) {
    it(`${action}: dono profissional pode`, () => {
      expect(() => assertCan(prof, action, ownPlan)).not.toThrow()
    })

    it(`${action}: outro gym → 404 (cross-tenant)`, () => {
      const otherGym: SessionUser = {
        userId: "u-prof",
        gymId: "gym-2",
        roles: ["profissional"],
        mustChangePassword: false,
      }
      expect(() => assertCan(otherGym, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: profissional não-dono mesmo gym → 404 (IDOR)`, () => {
      const otherProf: SessionUser = {
        userId: "u-prof-2",
        gymId: "gym-1",
        roles: ["profissional"],
        mustChangePassword: false,
      }
      expect(() => assertCan(otherProf, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: aluno → 404`, () => {
      expect(() => assertCan(aluno, action, ownPlan)).toThrow(NotFoundError)
    })
  }
})

describe("assertCan — workoutPlan:read por aluno (RN-ATR-04)", () => {
  it("aluno COM atribuição ativa pode ler", () => {
    expect(() =>
      assertCan(aluno, "workoutPlan:read", { ...ownPlan, viewerHasActiveAssignment: true }),
    ).not.toThrow()
  })

  it("aluno SEM atribuição ativa → 404", () => {
    expect(() =>
      assertCan(aluno, "workoutPlan:read", { ...ownPlan, viewerHasActiveAssignment: false }),
    ).toThrow(NotFoundError)
  })

  it("atribuição ativa de OUTRO gym não vale (cross-tenant) → 404", () => {
    const alunoOtherGym: SessionUser = { userId: "u-aluno", gymId: "gym-2", roles: ["aluno"], mustChangePassword: false }
    expect(() =>
      assertCan(alunoOtherGym, "workoutPlan:read", {
        ...ownPlan,
        viewerHasActiveAssignment: true,
      }),
    ).toThrow(NotFoundError)
  })
})

describe("assertCan — assignment:create / assignment:revoke", () => {
  for (const action of ["assignment:create", "assignment:revoke"] as const) {
    it(`${action}: profissional dono/responsável pode`, () => {
      expect(() => assertCan(prof, action, ownPlan)).not.toThrow()
    })

    it(`${action}: profissional não-dono mesmo gym → 404`, () => {
      const otherProf: SessionUser = { userId: "u-prof-2", gymId: "gym-1", roles: ["profissional"], mustChangePassword: false }
      expect(() => assertCan(otherProf, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: outro gym → 404 (cross-tenant)`, () => {
      const otherGym: SessionUser = { userId: "u-prof", gymId: "gym-2", roles: ["profissional"], mustChangePassword: false }
      expect(() => assertCan(otherGym, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: aluno → 404`, () => {
      expect(() => assertCan(aluno, action, ownPlan)).toThrow(NotFoundError)
    })
  }
})

describe("assertCan — link:invite", () => {
  it("profissional pode criar convite", () => {
    expect(() => assertCan(prof, "link:invite")).not.toThrow()
  })
  it("aluno não pode criar convite → NotFoundError", () => {
    expect(() => assertCan(aluno, "link:invite")).toThrow(NotFoundError)
  })
})

describe("assertCan — link:accept", () => {
  const resource: OwnedResource = { gymId: "gym-1", createdBy: "u-prof" }
  it("aluno do mesmo gym pode aceitar", () => {
    expect(() => assertCan(aluno, "link:accept", resource)).not.toThrow()
  })
  it("aluno de outro gym não pode aceitar → NotFoundError", () => {
    const alunoOutroGym: SessionUser = { userId: "u-aluno-2", gymId: "outro-gym", roles: ["aluno"], mustChangePassword: false }
    expect(() => assertCan(alunoOutroGym, "link:accept", resource)).toThrow(NotFoundError)
  })
  it("profissional não pode aceitar convite → NotFoundError", () => {
    expect(() => assertCan(prof, "link:accept", resource)).toThrow(NotFoundError)
  })
})

describe("assertCan — workoutLog:update", () => {
  const resource: OwnedResource = { gymId: "gym-1", createdBy: "u-aluno" }
  it("aluno dono do log pode atualizar", () => {
    expect(() => assertCan(aluno, "workoutLog:update", resource)).not.toThrow()
  })
  it("outro aluno não pode atualizar log alheio → NotFoundError", () => {
    const aluno2: SessionUser = { userId: "u-aluno-2", gymId: "gym-1", roles: ["aluno"], mustChangePassword: false }
    expect(() => assertCan(aluno2, "workoutLog:update", resource)).toThrow(NotFoundError)
  })
  it("profissional não pode atualizar log de aluno → NotFoundError", () => {
    expect(() => assertCan(prof, "workoutLog:update", resource)).toThrow(NotFoundError)
  })
  it("aluno de outro gym → NotFoundError", () => {
    const alunoOutroGym: SessionUser = { userId: "u-aluno", gymId: "outro-gym", roles: ["aluno"], mustChangePassword: false }
    expect(() => assertCan(alunoOutroGym, "workoutLog:update", resource)).toThrow(NotFoundError)
  })
})
