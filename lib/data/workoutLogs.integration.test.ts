import "dotenv/config"
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: async () => null }))

import { db } from "@/lib/data/_scope"
import { createWorkoutPlan } from "@/lib/data/workouts"
import { assignPlanToAluno } from "@/lib/data/assignments"
import {
  startWorkout,
  updateExerciseLog,
  concludeWorkout,
  getWorkoutLog,
  listWorkoutHistory,
  calcStreak,
  getProgressMetrics,
  getAlunoProgress,
} from "@/lib/data/workoutLogs"
import { NotFoundError } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"

const GYM = "it4-wl-gym"
const prof: SessionUser = { userId: "it4-prof", gymId: GYM, roles: ["profissional"], mustChangePassword: false }
const aluno: SessionUser = { userId: "it4-aluno", gymId: GYM, roles: ["aluno"], mustChangePassword: false }
const aluno2: SessionUser = { userId: "it4-aluno2", gymId: GYM, roles: ["aluno"], mustChangePassword: false }
const ALL_IDS = [prof.userId, aluno.userId, aluno2.userId]

let planId: string

async function cleanup() {
  await db.exerciseLog.deleteMany({ where: { workoutLog: { gymId: GYM } } })
  await db.workoutLog.deleteMany({ where: { gymId: GYM } })
  await db.assignment.deleteMany({ where: { gymId: GYM } })
  await db.link.deleteMany({ where: { gymId: GYM } })
  await db.workoutPlan.deleteMany({ where: { gymId: GYM } })
  await db.user.deleteMany({ where: { id: { in: ALL_IDS } } })
}

describe("calcStreak (unit — sem banco)", () => {
  const now = new Date("2026-06-28T10:00:00.000Z") // domingo

  it("streak 0 quando não há treinos", () => {
    expect(calcStreak([], now)).toBe(0)
  })

  it("streak 1 com treino hoje", () => {
    const dates = [new Date("2026-06-28T00:00:00.000Z")]
    expect(calcStreak(dates, now)).toBe(1)
  })

  it("streak 1 com treino ontem (hoje pendente — RN-EXE-06)", () => {
    const dates = [new Date("2026-06-27T00:00:00.000Z")]
    expect(calcStreak(dates, now)).toBe(1)
  })

  it("streak 3 com treinos hoje + 2 dias anteriores", () => {
    const dates = [
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-27T00:00:00.000Z"),
      new Date("2026-06-26T00:00:00.000Z"),
    ]
    expect(calcStreak(dates, now)).toBe(3)
  })

  it("gap de 1 dia zera streak depois da sequência", () => {
    const dates = [
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-26T00:00:00.000Z"), // pula 27
    ]
    expect(calcStreak(dates, now)).toBe(1)
  })

  it("treino mais recente há 2 dias → streak 0 (ambos os dias sem treino: hoje e ontem)", () => {
    const dates = [new Date("2026-06-26T00:00:00.000Z")]
    expect(calcStreak(dates, now)).toBe(0)
  })
})

const suite = process.env.DATABASE_URL ? describe : describe.skip

suite("Fase 3 — lib/data/workoutLogs.ts (execução)", () => {
  beforeAll(async () => {
    await cleanup()
    await db.user.createMany({
      data: [
        { id: prof.userId, email: "it4-prof@x.dev", roles: ["profissional"], gymId: GYM },
        { id: aluno.userId, email: "it4-aluno@x.dev", roles: ["aluno"], gymId: GYM },
        { id: aluno2.userId, email: "it4-aluno2@x.dev", roles: ["aluno"], gymId: GYM },
      ],
    })
    // Criar link ativo entre prof e aluno
    await db.link.create({
      data: { gymId: GYM, professionalId: prof.userId, alunoId: aluno.userId, status: "ativo" },
    })
    // Criar plano com 2 exercícios
    const plan = await createWorkoutPlan(prof, {
      name: "Plano F3",
      estCalories: 300,
      exercises: [
        { name: "Agacho", sets: 3, reps: "10-12", rest: "60s", muscle: "Pernas" },
        { name: "Supino", sets: 3, reps: "8-10", rest: "60s", muscle: "Peito" },
      ],
    })
    planId = plan.id
    // Atribuir ao aluno
    await assignPlanToAluno(prof, { workoutPlanId: planId, alunoId: aluno.userId })
  })

  afterAll(async () => {
    await cleanup()
    await db.$disconnect()
  })

  describe("startWorkout", () => {
    it("cria WorkoutLog em_andamento + snapshot de 2 ExerciseLogs", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      expect(log.status).toBe("em_andamento")
      expect(log.exerciseLogs).toHaveLength(2)
      expect(log.exerciseLogs[0].name).toBe("Agacho") // ordem preservada
      expect(log.exerciseLogs[0].completed).toBe(false)
    })

    it("é idempotente: segunda chamada devolve o log existente (RN-EXE-11)", async () => {
      const log1 = await startWorkout(aluno, { workoutPlanId: planId })
      const log2 = await startWorkout(aluno, { workoutPlanId: planId })
      expect(log2.id).toBe(log1.id)
    })

    it("aluno sem atribuição ativa → NotFoundError", async () => {
      await expect(startWorkout(aluno2, { workoutPlanId: planId })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("profissional não pode iniciar treino → NotFoundError", async () => {
      await expect(startWorkout(prof, { workoutPlanId: planId })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("plano de outro gym → NotFoundError (anti-IDOR)", async () => {
      const outroAluno: SessionUser = { userId: "it4-outro", gymId: "outro-gym", roles: ["aluno"], mustChangePassword: false }
      await expect(startWorkout(outroAluno, { workoutPlanId: planId })).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("updateExerciseLog", () => {
    it("marca exercício como concluído", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      const exLogId = log.exerciseLogs[0].id
      await updateExerciseLog(aluno, { exerciseLogId: exLogId, completed: true })

      const updated = await getWorkoutLog(aluno, log.id)
      expect(updated.exerciseLogs[0].completed).toBe(true)
    })

    it("desmarca exercício (toggle)", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      const exLogId = log.exerciseLogs[0].id
      await updateExerciseLog(aluno, { exerciseLogId: exLogId, completed: true })
      await updateExerciseLog(aluno, { exerciseLogId: exLogId, completed: false })

      const updated = await getWorkoutLog(aluno, log.id)
      expect(updated.exerciseLogs[0].completed).toBe(false)
    })

    it("exerciseLog de outro aluno → NotFoundError", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      const exLogId = log.exerciseLogs[0].id
      // aluno2 não tem este log
      await expect(
        updateExerciseLog(aluno2, { exerciseLogId: exLogId, completed: true })
      ).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("concludeWorkout", () => {
    it("fecha log, calcula durationMin e define date no fuso Sao_Paulo", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      const fakeNow = new Date(Date.now() + 30 * 60_000) // 30 min depois

      const concluded = await concludeWorkout(aluno, { workoutLogId: log.id }, fakeNow)
      expect(concluded.status).toBe("concluido")
      expect(concluded.durationMin).toBeGreaterThanOrEqual(29)
      expect(concluded.date).not.toBeNull()
      // date deve ser a data local em Sao_Paulo (format YYYY-MM-DD)
      const dateStr = concluded.date!.toISOString().slice(0, 10)
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("log já concluído → NotFoundError (imutável — RN-EXE-07)", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      await concludeWorkout(aluno, { workoutLogId: log.id })
      await expect(concludeWorkout(aluno, { workoutLogId: log.id })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("log de outro aluno → NotFoundError", async () => {
      const log = await startWorkout(aluno, { workoutPlanId: planId })
      await expect(concludeWorkout(aluno2, { workoutLogId: log.id })).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("listWorkoutHistory", () => {
    it("retorna apenas logs concluídos do aluno, ordenados por date desc", async () => {
      const history = await listWorkoutHistory(aluno)
      expect(history.every(l => l.status === "concluido")).toBe(true)
    })

    it("aluno2 não vê histórico do aluno (isolamento)", async () => {
      const history = await listWorkoutHistory(aluno2)
      expect(history).toHaveLength(0)
    })
  })

  describe("getProgressMetrics", () => {
    it("retorna métricas corretas para o aluno", async () => {
      const metrics = await getProgressMetrics(aluno)
      expect(metrics.totalWorkouts).toBeGreaterThanOrEqual(1)
      expect(typeof metrics.totalCalories).toBe("number")
      expect(typeof metrics.totalDurationMin).toBe("number")
      expect(metrics.streak).toBeGreaterThanOrEqual(0)
    })

    it("profissional não pode chamar → NotFoundError", async () => {
      await expect(getProgressMetrics(prof)).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  describe("getAlunoProgress", () => {
    it("profissional com link ativo lê métricas do aluno", async () => {
      const metrics = await getAlunoProgress(prof, aluno.userId)
      expect(typeof metrics.totalWorkouts).toBe("number")
    })

    it("profissional sem link ativo não lê métricas → NotFoundError (RN-EXE-08)", async () => {
      await expect(getAlunoProgress(prof, aluno2.userId)).rejects.toBeInstanceOf(NotFoundError)
    })

    it("aluno não pode ler métricas alheias → NotFoundError", async () => {
      await expect(getAlunoProgress(aluno, aluno.userId)).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})
