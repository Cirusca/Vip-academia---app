"use server"

import { requireSession } from "@/lib/auth/session"
import {
  startWorkoutSchema,
  updateExerciseLogSchema,
  concludeWorkoutSchema,
} from "@/lib/validation/workoutLog"
import { startWorkout, updateExerciseLog, concludeWorkout } from "@/lib/data/workoutLogs"
import { NotFoundError } from "@/lib/auth/errors"

type StartResult = { workoutLogId?: string; exerciseLogs?: unknown[]; error?: string }

/**
 * Inicia sessão de treino: valida atribuição, cria WorkoutLog + snapshot (RN-EXE-01/09).
 * Idempotente: se já em_andamento, devolve o log existente (RN-EXE-11).
 */
export async function startWorkoutAction(formData: FormData): Promise<StartResult> {
  try {
    const session = await requireSession()

    const raw = { workoutPlanId: formData.get("workoutPlanId") }
    const parsed = startWorkoutSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." }
    }

    const log = await startWorkout(session, parsed.data)
    return { workoutLogId: log.id, exerciseLogs: log.exerciseLogs }
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Treino não encontrado ou sem atribuição ativa." }
    }
    console.error("[startWorkoutAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }
}

/** Marca/desmarca exercício como concluído (RN-EXE-02). */
export async function updateExerciseLogAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireSession()

    const completedRaw = formData.get("completed")
    const raw = {
      exerciseLogId: formData.get("exerciseLogId"),
      completed: completedRaw === "true" ? true : completedRaw === "false" ? false : undefined,
    }
    const parsed = updateExerciseLogSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." }
    }

    await updateExerciseLog(session, parsed.data)
    return {}
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Exercício não encontrado ou treino já concluído." }
    }
    console.error("[updateExerciseLogAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }
}

/** Conclui o treino e torna o log imutável (RN-EXE-04/07/10). */
export async function concludeWorkoutAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireSession()

    const raw = { workoutLogId: formData.get("workoutLogId") }
    const parsed = concludeWorkoutSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." }
    }

    await concludeWorkout(session, parsed.data)
    return {}
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Treino não encontrado ou já concluído." }
    }
    console.error("[concludeWorkoutAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }
}
