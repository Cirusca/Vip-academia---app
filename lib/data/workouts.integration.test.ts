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
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "@/lib/data/workouts"
import { AssignmentStatus, WorkoutPlanStatus } from "@/lib/generated/prisma/enums"
import { assignPlanToAluno } from "@/lib/data/assignments"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const GYM_A = "it-gymA"
const GYM_B = "it-gymB"

const profA: SessionUser = { userId: "it-profA", gymId: GYM_A, roles: ["profissional"], mustChangePassword: false }
const alunoA: SessionUser = { userId: "it-alunoA", gymId: GYM_A, roles: ["aluno"], mustChangePassword: false }
const profB: SessionUser = { userId: "it-profB", gymId: GYM_B, roles: ["profissional"], mustChangePassword: false }

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

suite("updateWorkoutPlan", () => {
  let updatePlanId: string

  beforeAll(async () => {
    await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.user.deleteMany({ where: { id: { in: [profA.userId, alunoA.userId, profB.userId] } } })
    await db.user.createMany({
      data: [
        { id: profA.userId, email: "it-profA-u@x.dev", roles: ["profissional"], gymId: GYM_A },
        { id: alunoA.userId, email: "it-alunoA-u@x.dev", roles: ["aluno"], gymId: GYM_A },
        { id: profB.userId, email: "it-profB-u@x.dev", roles: ["profissional"], gymId: GYM_B },
      ],
    })
    const created = await createWorkoutPlan(profA, {
      name: "Plano para editar",
      day: "Segunda",
      estDuration: 45,
      exercises: [{ name: "Supino", sets: 3, reps: "10", rest: "60s", muscle: "Peito" }],
    })
    updatePlanId = created.id
  })

  afterAll(async () => {
    await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.user.deleteMany({ where: { id: { in: [profA.userId, alunoA.userId, profB.userId] } } })
  })

  it("dono atualiza nome do plano", async () => {
    const updated = await updateWorkoutPlan(profA, {
      workoutPlanId: updatePlanId,
      name: "Plano Editado",
    })
    expect(updated.name).toBe("Plano Editado")
  })

  it("atualiza exercícios — substitui todos (deleteMany + create)", async () => {
    const updated = await updateWorkoutPlan(profA, {
      workoutPlanId: updatePlanId,
      exercises: [
        { name: "Agacho", sets: 4, reps: "12", rest: "90s", muscle: "Pernas" },
        { name: "Leg Press", sets: 3, reps: "15", rest: "60s", muscle: "Pernas" },
      ],
    })
    expect(updated.exercises).toHaveLength(2)
    expect(updated.exercises[0].name).toBe("Agacho")
    expect(updated.exercises[0].id).toBe(1)
  })

  it("update sem exercises mantém os existentes", async () => {
    const before = await getWorkoutPlanById(profA, updatePlanId)
    const updated = await updateWorkoutPlan(profA, {
      workoutPlanId: updatePlanId,
      name: "Só muda o nome",
    })
    expect(updated.exercises).toHaveLength(before.exercises.length)
  })

  it("profissional de outro gym NÃO atualiza → 404 (IDOR)", async () => {
    await expect(
      updateWorkoutPlan(profB, { workoutPlanId: updatePlanId, name: "Hack" }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("aluno NÃO atualiza → 404", async () => {
    await expect(
      updateWorkoutPlan(alunoA, { workoutPlanId: updatePlanId, name: "Hack" }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})

suite("deleteWorkoutPlan (soft-delete)", () => {
  let deletePlanId: string

  beforeAll(async () => {
    await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.link.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.user.deleteMany({ where: { id: { in: [profA.userId, alunoA.userId, profB.userId] } } })
    await db.user.createMany({
      data: [
        { id: profA.userId, email: "it-profA-d@x.dev", roles: ["profissional"], gymId: GYM_A },
        { id: alunoA.userId, email: "it-alunoA-d@x.dev", roles: ["aluno"], gymId: GYM_A },
        { id: profB.userId, email: "it-profB-d@x.dev", roles: ["profissional"], gymId: GYM_B },
      ],
    })
    const created = await createWorkoutPlan(profA, {
      name: "Plano para deletar",
      exercises: [{ name: "Barra", sets: 3, reps: "8", rest: "120s", muscle: "Costas" }],
    })
    deletePlanId = created.id
    // Gate de vínculo (RN-ATR-02): atribuir exige Link ativo prof↔aluno.
    await db.link.create({
      data: { gymId: GYM_A, professionalId: profA.userId, alunoId: alunoA.userId, status: "ativo" },
    })
    await assignPlanToAluno(profA, { workoutPlanId: deletePlanId, alunoId: alunoA.userId })
  })

  afterAll(async () => {
    await db.workoutPlan.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.link.deleteMany({ where: { gymId: { in: [GYM_A, GYM_B] } } })
    await db.user.deleteMany({ where: { id: { in: [profA.userId, alunoA.userId, profB.userId] } } })
    await db.$disconnect()
  })

  it("profB de outro gym NÃO deleta → 404 (IDOR)", async () => {
    await expect(
      deleteWorkoutPlan(profB, { workoutPlanId: deletePlanId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("aluno NÃO deleta → 404", async () => {
    await expect(
      deleteWorkoutPlan(alunoA, { workoutPlanId: deletePlanId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("dono deleta → plano sai de listWorkoutPlans + assignments ativas ficam pausadas", async () => {
    await deleteWorkoutPlan(profA, { workoutPlanId: deletePlanId })
    const list = await listWorkoutPlans(profA)
    expect(list.some((p) => p.id === deletePlanId)).toBe(false)
    const raw = await db.workoutPlan.findUnique({ where: { id: deletePlanId } })
    expect(raw?.status).toBe(WorkoutPlanStatus.inativo)
    expect(raw?.deletedAt).not.toBeNull()
    const asgn = await db.assignment.findFirst({ where: { workoutPlanId: deletePlanId } })
    expect(asgn?.status).toBe(AssignmentStatus.pausada)
  })

  it("deletar plano já inativo → 404", async () => {
    await expect(
      deleteWorkoutPlan(profA, { workoutPlanId: deletePlanId }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
