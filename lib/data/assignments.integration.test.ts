import "dotenv/config"
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"

// Evita carregar next-auth: as funções recebem a sessão explícita.
vi.mock("@/auth", () => ({ auth: async () => null }))

import { db } from "@/lib/data/_scope"
import { createWorkoutPlan, listWorkoutPlans, getWorkoutPlanById } from "@/lib/data/workouts"
import { assignPlanToAluno, revokeAssignment } from "@/lib/data/assignments"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const GYM_A = "it2-gymA"
const GYM_B = "it2-gymB"

const profA: SessionUser = { userId: "it2-profA", gymId: GYM_A, roles: ["profissional"] }
const profA2: SessionUser = { userId: "it2-profA2", gymId: GYM_A, roles: ["profissional"] }
const alunoA: SessionUser = { userId: "it2-alunoA", gymId: GYM_A, roles: ["aluno"] }
const alunoA2: SessionUser = { userId: "it2-alunoA2", gymId: GYM_A, roles: ["aluno"] }
const profB: SessionUser = { userId: "it2-profB", gymId: GYM_B, roles: ["profissional"] }

const ALL_IDS = [profA, profA2, alunoA, alunoA2, profB].map((s) => s.userId)

async function cleanup() {
  await db.assignment.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
  await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
  await db.user.deleteMany({ where: { id: { in: ALL_IDS } } })
}

const suite = process.env.DATABASE_URL ? describe : describe.skip

suite("Fase 2 — atribuições (escopo por papel / RN-ATR)", () => {
  let planId: string

  beforeAll(async () => {
    await cleanup()
    await db.user.createMany({
      data: [
        { id: profA.userId, email: "it2-profA@x.dev", roles: ["profissional"], gymId: GYM_A },
        { id: profA2.userId, email: "it2-profA2@x.dev", roles: ["profissional"], gymId: GYM_A },
        { id: alunoA.userId, email: "it2-alunoA@x.dev", roles: ["aluno"], gymId: GYM_A },
        { id: alunoA2.userId, email: "it2-alunoA2@x.dev", roles: ["aluno"], gymId: GYM_A },
        { id: profB.userId, email: "it2-profB@x.dev", roles: ["profissional"], gymId: GYM_B },
      ],
    })
    const created = await createWorkoutPlan(profA, {
      name: "Plano F2",
      exercises: [{ name: "Agacho", sets: 3, reps: "10", rest: "60s", muscle: "Pernas" }],
    })
    planId = created.id
  })

  afterAll(async () => {
    await cleanup()
    await db.$disconnect()
  })

  it("antes de atribuir: aluno não lista nem lê o plano (RN-ATR-04)", async () => {
    expect(await listWorkoutPlans(alunoA)).toHaveLength(0)
    await expect(getWorkoutPlanById(alunoA, planId)).rejects.toBeInstanceOf(NotFoundError)
  })

  it("profissional de OUTRO gym não consegue atribuir o plano → 404 (IDOR)", async () => {
    await expect(
      assignPlanToAluno(profB, { workoutPlanId: planId, alunoId: alunoA.userId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("profissional do mesmo gym mas NÃO-dono não consegue atribuir → 404 (posse)", async () => {
    await expect(
      assignPlanToAluno(profA2, { workoutPlanId: planId, alunoId: alunoA.userId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("aluno não consegue atribuir (só profissional) → 404", async () => {
    await expect(
      assignPlanToAluno(alunoA, { workoutPlanId: planId, alunoId: alunoA2.userId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("atribuir a um alvo que não é aluno do gym → 404", async () => {
    // profA2 é profissional (não-aluno) no mesmo gym: alvo inválido.
    await expect(
      assignPlanToAluno(profA, { workoutPlanId: planId, alunoId: profA2.userId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("dono atribui ao aluno → aluno passa a listar e ler o plano", async () => {
    const { id } = await assignPlanToAluno(profA, {
      workoutPlanId: planId,
      alunoId: alunoA.userId,
    })
    expect(id).toBeTruthy()

    const list = await listWorkoutPlans(alunoA)
    expect(list.map((p) => p.id)).toContain(planId)

    const plan = await getWorkoutPlanById(alunoA, planId)
    expect(plan.name).toBe("Plano F2")

    // Outro aluno do mesmo gym, sem atribuição, continua sem ver (RN-ATR-04).
    expect(await listWorkoutPlans(alunoA2)).toHaveLength(0)
    await expect(getWorkoutPlanById(alunoA2, planId)).rejects.toBeInstanceOf(NotFoundError)
  })

  it("reatribuir o mesmo par é no-op idempotente (RN-ATR-08)", async () => {
    const again = await assignPlanToAluno(profA, {
      workoutPlanId: planId,
      alunoId: alunoA.userId,
    })
    const active = await db.assignment.count({
      where: { workoutPlanId: planId, alunoId: alunoA.userId, status: "ativa" },
    })
    expect(active).toBe(1)
    expect(again.id).toBeTruthy()
  })

  it("profissional dono ainda vê o próprio plano (visão de profissional)", async () => {
    const list = await listWorkoutPlans(profA)
    expect(list.map((p) => p.id)).toContain(planId)
  })

  it("revogar: aluno deixa de ver; cross-tenant não revoga", async () => {
    const assignment = await db.assignment.findFirstOrThrow({
      where: { workoutPlanId: planId, alunoId: alunoA.userId, status: "ativa" },
      select: { id: true },
    })

    // profB (outro gym) não revoga → 404 e atribuição segue ativa.
    await expect(
      revokeAssignment(profB, { assignmentId: assignment.id }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(
      await db.assignment.count({ where: { id: assignment.id, status: "ativa" } }),
    ).toBe(1)

    // dono revoga → vira pausada; aluno não lista mais.
    await revokeAssignment(profA, { assignmentId: assignment.id })
    expect(await listWorkoutPlans(alunoA)).toHaveLength(0)
    await expect(getWorkoutPlanById(alunoA, planId)).rejects.toBeInstanceOf(NotFoundError)
  })
})
