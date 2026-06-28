import "dotenv/config"
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"

// Evita carregar next-auth no vitest: as funções recebem a sessão explícita,
// então `requireSession`/`auth()` não são exercitados aqui.
vi.mock("@/auth", () => ({ auth: async () => null }))

import { db } from "@/lib/data/_scope"
import {
  listWorkoutPlans,
  createWorkoutPlan,
  getWorkoutPlanById,
} from "@/lib/data/workouts"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const GYM_A = "it-gymA"
const GYM_B = "it-gymB"

const profA: SessionUser = { userId: "it-profA", gymId: GYM_A, roles: ["profissional"] }
const alunoA: SessionUser = { userId: "it-alunoA", gymId: GYM_A, roles: ["aluno"] }
const profB: SessionUser = { userId: "it-profB", gymId: GYM_B, roles: ["profissional"] }

async function cleanup() {
  await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
  await db.user.deleteMany({ where: { id: { in: [profA.userId, alunoA.userId, profB.userId] } } })
}

// Roda só quando há banco configurado (.env presente).
const suite = process.env.DATABASE_URL ? describe : describe.skip

suite("fatia vertical — autorização (cross-tenant / IDOR)", () => {
  let planId: string

  beforeAll(async () => {
    await cleanup()
    await db.user.createMany({
      data: [
        { id: profA.userId, email: "it-profA@x.dev", roles: ["profissional"], gymId: GYM_A },
        { id: alunoA.userId, email: "it-alunoA@x.dev", roles: ["aluno"], gymId: GYM_A },
        { id: profB.userId, email: "it-profB@x.dev", roles: ["profissional"], gymId: GYM_B },
      ],
    })
    const created = await createWorkoutPlan(profA, {
      name: "Plano de teste",
      exercises: [{ name: "Agacho", sets: 3, reps: "10", rest: "60s", muscle: "Pernas" }],
    })
    planId = created.id
  })

  afterAll(async () => {
    await cleanup()
    await db.$disconnect()
  })

  it("dono (profA) lê o próprio plano", async () => {
    const plan = await getWorkoutPlanById(profA, planId)
    expect(plan.name).toBe("Plano de teste")
    const list = await listWorkoutPlans(profA)
    expect(list.some((p) => p.id === planId)).toBe(true)
  })

  it("outro gym (profB) NÃO lista o plano (isolamento de tenant)", async () => {
    const list = await listWorkoutPlans(profB)
    expect(list.some((p) => p.id === planId)).toBe(false)
  })

  it("outro gym (profB) NÃO lê por id → 404 (IDOR)", async () => {
    await expect(getWorkoutPlanById(profB, planId)).rejects.toBeInstanceOf(NotFoundError)
  })

  it("aluno do mesmo gym NÃO lê por id → 404", async () => {
    await expect(getWorkoutPlanById(alunoA, planId)).rejects.toBeInstanceOf(NotFoundError)
  })

  it("createWorkoutPlan carimba gymId/createdBy da sessão (não do input)", async () => {
    const created = await createWorkoutPlan(profA, {
      name: "Outro plano",
      exercises: [{ name: "Flexão", sets: 3, reps: "12", rest: "45s", muscle: "Peito" }],
    })
    const row = await db.workoutPlan.findUnique({
      where: { id: created.id },
      select: { gymId: true, createdBy: true },
    })
    expect(row).toEqual({ gymId: GYM_A, createdBy: profA.userId })
  })
})
