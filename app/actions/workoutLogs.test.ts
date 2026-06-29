import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth/session", () => ({ requireSession: vi.fn() }))
vi.mock("@/lib/data/workoutLogs", () => ({
  startWorkout: vi.fn(),
  updateExerciseLog: vi.fn(),
  concludeWorkout: vi.fn(),
}))

import { requireSession } from "@/lib/auth/session"
import { startWorkout, updateExerciseLog, concludeWorkout } from "@/lib/data/workoutLogs"
import {
  startWorkoutAction,
  updateExerciseLogAction,
  concludeWorkoutAction,
} from "@/app/actions/workoutLogs"
import { NotFoundError } from "@/lib/auth/errors"

const alunoSession = { userId: "a1", gymId: "gym1", roles: ["aluno" as const], mustChangePassword: false }

beforeEach(() => vi.clearAllMocks())

describe("startWorkoutAction", () => {
  it("sucesso → retorna id do log", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(startWorkout).mockResolvedValue({
      id: "wl1", workoutPlanId: "p1", workoutPlanName: "Plano A",
      status: "em_andamento" as const, date: null, startedAt: new Date(),
      concludedAt: null, durationMin: null, caloriesBurned: null, exerciseLogs: [],
    })
    const fd = new FormData()
    fd.set("workoutPlanId", "p1")
    const result = await startWorkoutAction(fd)
    expect(result.workoutLogId).toBe("wl1")
    expect(result.error).toBeUndefined()
  })

  it("workoutPlanId vazio → erro de validação, data layer não chamada", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    const fd = new FormData()
    fd.set("workoutPlanId", "")
    const result = await startWorkoutAction(fd)
    expect(result.error).toBeTruthy()
    expect(vi.mocked(startWorkout)).not.toHaveBeenCalled()
  })

  it("NotFoundError da data layer → mensagem genérica", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(startWorkout).mockRejectedValue(new NotFoundError())
    const fd = new FormData()
    fd.set("workoutPlanId", "p1")
    const result = await startWorkoutAction(fd)
    expect(result.error).toBeTruthy()
  })
})

describe("updateExerciseLogAction", () => {
  it("marca exercício → sem erro", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(updateExerciseLog).mockResolvedValue(undefined)
    const fd = new FormData()
    fd.set("exerciseLogId", "el1")
    fd.set("completed", "true")
    const result = await updateExerciseLogAction(fd)
    expect(result.error).toBeUndefined()
  })

  it("completed ausente → erro de validação", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    const fd = new FormData()
    fd.set("exerciseLogId", "el1")
    // sem 'completed'
    const result = await updateExerciseLogAction(fd)
    expect(result.error).toBeTruthy()
  })
})

describe("concludeWorkoutAction", () => {
  it("sucesso → sem erro", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(concludeWorkout).mockResolvedValue({
      id: "wl1", workoutPlanId: "p1", workoutPlanName: null,
      status: "concluido" as const, date: new Date(), startedAt: new Date(),
      concludedAt: new Date(), durationMin: 30, caloriesBurned: 300, exerciseLogs: [],
    })
    const fd = new FormData()
    fd.set("workoutLogId", "wl1")
    const result = await concludeWorkoutAction(fd)
    expect(result.error).toBeUndefined()
  })
})
