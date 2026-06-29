import "dotenv/config"
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: async () => null }))

import { db } from "@/lib/data/_scope"
import { createInvite, acceptInvite, endLink, listAlunos, getActiveLink } from "@/lib/data/links"
import { assignPlanToAluno } from "@/lib/data/assignments"
import { createWorkoutPlan } from "@/lib/data/workouts"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const GYM = "it3-link-gym"
const GYM_B = "it3-link-gymB"

const prof: SessionUser = { userId: "it3-prof", gymId: GYM, roles: ["profissional"], mustChangePassword: false }
const aluno: SessionUser = { userId: "it3-aluno", gymId: GYM, roles: ["aluno"], mustChangePassword: false }
const aluno2: SessionUser = { userId: "it3-aluno2", gymId: GYM, roles: ["aluno"], mustChangePassword: false }
const profB: SessionUser = { userId: "it3-profB", gymId: GYM_B, roles: ["profissional"], mustChangePassword: false }

const ALL_IDS = [prof, aluno, aluno2, profB].map(s => s.userId)
const ALL_GYMS = [GYM, GYM_B]

async function cleanup() {
  await db.assignment.deleteMany({ where: { gymId: { in: ALL_GYMS } } })
  await db.link.deleteMany({ where: { gymId: { in: ALL_GYMS } } })
  await db.workoutPlan.deleteMany({ where: { gymId: { in: ALL_GYMS } } })
  await db.user.deleteMany({ where: { id: { in: ALL_IDS } } })
}

const suite = process.env.DATABASE_URL ? describe : describe.skip

suite("Fase 3 — lib/data/links.ts", () => {
  beforeAll(async () => {
    await cleanup()
    await db.user.createMany({
      data: [
        { id: prof.userId, email: "it3-prof@x.dev", roles: ["profissional"], gymId: GYM },
        { id: aluno.userId, email: "it3-aluno@x.dev", roles: ["aluno"], gymId: GYM },
        { id: aluno2.userId, email: "it3-aluno2@x.dev", roles: ["aluno"], gymId: GYM },
        { id: profB.userId, email: "it3-profB@x.dev", roles: ["profissional"], gymId: GYM_B },
      ],
    })
  })

  afterAll(async () => {
    await cleanup()
    await db.$disconnect()
  })

  describe("createInvite", () => {
    it("gera código de 8 hex maiúsculos e link pendente", async () => {
      const result = await createInvite(prof)
      expect(result.inviteCode).toMatch(/^[0-9A-F]{8}$/)
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())

      const link = await db.link.findFirst({
        where: { professionalId: prof.userId, status: "pendente", gymId: GYM },
        select: { inviteCode: true, status: true },
      })
      expect(link?.inviteCode).toBe(result.inviteCode)
      expect(link?.status).toBe("pendente")
    })

    it("aluno não pode criar convite → NotFoundError", async () => {
      await expect(createInvite(aluno)).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("acceptInvite", () => {
    it("aceita convite → link ativo, alunoId preenchido, inviteCode consumido", async () => {
      const { inviteCode } = await createInvite(prof)
      await acceptInvite(aluno, { code: inviteCode })

      const link = await db.link.findFirst({
        where: { professionalId: prof.userId, alunoId: aluno.userId },
        select: { status: true, inviteCode: true, alunoId: true },
      })
      expect(link?.status).toBe("ativo")
      expect(link?.inviteCode).toBeNull() // consumido
      expect(link?.alunoId).toBe(aluno.userId)
    })

    it("código inexistente → NotFoundError", async () => {
      await expect(acceptInvite(aluno2, { code: "DEADBEEF" })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("código expirado → NotFoundError", async () => {
      await db.link.create({
        data: {
          id: "it3-expired",
          gymId: GYM,
          professionalId: prof.userId,
          status: "pendente",
          inviteCode: "EXPIR3D0",
          inviteExpiresAt: new Date(Date.now() - 1000),
        },
      })
      await expect(acceptInvite(aluno2, { code: "EXPIR3D0" })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("aluno que já tem vínculo ativo não pode aceitar outro → NotFoundError (RN-VIN-03)", async () => {
      // aluno já tem link ativo com prof (do teste anterior)
      const { inviteCode } = await createInvite(prof)
      await expect(acceptInvite(aluno, { code: inviteCode })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("código do gym B não é aceito por aluno do gym A → NotFoundError", async () => {
      // Cria convite do prof de gym B
      await db.link.create({
        data: {
          id: "it3-gymB-link",
          gymId: GYM_B,
          professionalId: profB.userId,
          status: "pendente",
          inviteCode: "GYMB0001",
          inviteExpiresAt: new Date(Date.now() + 86_400_000),
        },
      })
      // aluno é do gym A → gym não bate
      await expect(acceptInvite(aluno, { code: "GYMB0001" })).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("listAlunos", () => {
    it("profissional lista alunos com link ativo", async () => {
      const result = await listAlunos(prof)
      expect(result.some(a => a.alunoId === aluno.userId)).toBe(true)
    })

    it("aluno não pode listar → NotFoundError", async () => {
      await expect(listAlunos(aluno)).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("getActiveLink", () => {
    it("aluno com link ativo recebe info do profissional", async () => {
      const result = await getActiveLink(aluno)
      expect(result).not.toBeNull()
      expect(result?.professionalId).toBe(prof.userId)
    })

    it("aluno sem link ativo recebe null", async () => {
      const result = await getActiveLink(aluno2)
      expect(result).toBeNull()
    })
  })

  describe("endLink", () => {
    it("encerra vínculo → status inativo + atribuições ativas do par pausadas", async () => {
      // Criar plano + atribuição para alunoA
      const plan = await createWorkoutPlan(prof, {
        name: "Plano para encerrar",
        exercises: [{ name: "Ex A", sets: 2, reps: "8", rest: "30s", muscle: "Peito" }],
      })
      await assignPlanToAluno(prof, { workoutPlanId: plan.id, alunoId: aluno.userId })

      // Pega o link ativo
      const link = await db.link.findFirst({
        where: { professionalId: prof.userId, alunoId: aluno.userId, status: "ativo" },
        select: { id: true },
      })
      expect(link).not.toBeNull()

      await endLink(prof, { linkId: link!.id })

      const updatedLink = await db.link.findUnique({ where: { id: link!.id }, select: { status: true } })
      expect(updatedLink?.status).toBe("inativo")

      const assignment = await db.assignment.findFirst({
        where: { workoutPlanId: plan.id, alunoId: aluno.userId },
        select: { status: true },
      })
      expect(assignment?.status).toBe("pausada")
    })

    it("terceiro não pode encerrar vínculo alheio → NotFoundError", async () => {
      // aluno2 não participa do link prof↔aluno
      const link = await db.link.findFirst({
        where: { professionalId: prof.userId, status: "inativo" }, // o único link existente (já inativo)
        select: { id: true },
      })
      // Cria um segundo link como referência
      const { inviteCode } = await createInvite(prof)
      // aluno2 aceita este convite
      await acceptInvite(aluno2, { code: inviteCode })
      const newLink = await db.link.findFirst({
        where: { professionalId: prof.userId, alunoId: aluno2.userId, status: "ativo" },
        select: { id: true },
      })
      // Agora aluno (sem vínculo ativo) tenta encerrar o link de aluno2
      await expect(endLink(aluno, { linkId: newLink!.id })).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})

// Suíte isolada: corrida de aceite concorrente (RN-VIN-03 sob concorrência).
// O índice parcial único garante 1 vínculo ativo; o perdedor deve ver NotFoundError
// (seja pelo check de vínculo existente, seja pela normalização do P2002), nunca um 500.
const RACE_GYM = "it3-race-gym"
const raceProf: SessionUser = { userId: "it3-race-prof", gymId: RACE_GYM, roles: ["profissional"], mustChangePassword: false }
const raceAluno: SessionUser = { userId: "it3-race-aluno", gymId: RACE_GYM, roles: ["aluno"], mustChangePassword: false }

suite("Fase 3 — acceptInvite sob concorrência", () => {
  beforeAll(async () => {
    await db.link.deleteMany({ where: { gymId: RACE_GYM } })
    await db.user.deleteMany({ where: { id: { in: [raceProf.userId, raceAluno.userId] } } })
    await db.user.createMany({
      data: [
        { id: raceProf.userId, email: "it3-race-prof@x.dev", roles: ["profissional"], gymId: RACE_GYM },
        { id: raceAluno.userId, email: "it3-race-aluno@x.dev", roles: ["aluno"], gymId: RACE_GYM },
      ],
    })
  })

  afterAll(async () => {
    await db.link.deleteMany({ where: { gymId: RACE_GYM } })
    await db.user.deleteMany({ where: { id: { in: [raceProf.userId, raceAluno.userId] } } })
    await db.$disconnect()
  })

  it("dois aceites concorrentes do mesmo aluno → 1 sucesso, 1 NotFoundError, 1 vínculo ativo", async () => {
    const a = await createInvite(raceProf)
    const b = await createInvite(raceProf)

    const results = await Promise.allSettled([
      acceptInvite(raceAluno, { code: a.inviteCode }),
      acceptInvite(raceAluno, { code: b.inviteCode }),
    ])

    const fulfilled = results.filter((r) => r.status === "fulfilled")
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    )
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(rejected[0].reason).toBeInstanceOf(NotFoundError)

    const activeCount = await db.link.count({
      where: { gymId: RACE_GYM, alunoId: raceAluno.userId, status: "ativo" },
    })
    expect(activeCount).toBe(1)
  })
})
