import { describe, it, expect } from "vitest"
import { assertCan, type OwnedResource } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const prof: SessionUser = { userId: "u-prof", gymId: "gym-1", roles: ["profissional"] }
const aluno: SessionUser = { userId: "u-aluno", gymId: "gym-1", roles: ["aluno"] }

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
      }
      expect(() => assertCan(otherGym, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: profissional não-dono mesmo gym → 404 (IDOR)`, () => {
      const otherProf: SessionUser = {
        userId: "u-prof-2",
        gymId: "gym-1",
        roles: ["profissional"],
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
    const alunoOtherGym: SessionUser = { userId: "u-aluno", gymId: "gym-2", roles: ["aluno"] }
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
      const otherProf: SessionUser = { userId: "u-prof-2", gymId: "gym-1", roles: ["profissional"] }
      expect(() => assertCan(otherProf, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: outro gym → 404 (cross-tenant)`, () => {
      const otherGym: SessionUser = { userId: "u-prof", gymId: "gym-2", roles: ["profissional"] }
      expect(() => assertCan(otherGym, action, ownPlan)).toThrow(NotFoundError)
    })

    it(`${action}: aluno → 404`, () => {
      expect(() => assertCan(aluno, action, ownPlan)).toThrow(NotFoundError)
    })
  }
})
