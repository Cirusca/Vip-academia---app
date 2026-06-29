import { z } from "zod"

const id = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`)

/** Iniciar treino: identifica o plano (a atribuição ativa é verificada na camada de dados). */
export const startWorkoutSchema = z.object({
  workoutPlanId: id("Plano de treino"),
})
export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>

/** Marcar/desmarcar exercício durante execução. */
export const updateExerciseLogSchema = z.object({
  exerciseLogId: id("Log de exercício"),
  completed: z.boolean({ required_error: "Campo 'completed' é obrigatório." }),
})
export type UpdateExerciseLogInput = z.infer<typeof updateExerciseLogSchema>

/** Concluir treino: o log é fechado na camada de dados. */
export const concludeWorkoutSchema = z.object({
  workoutLogId: id("Log de treino"),
})
export type ConcludeWorkoutInput = z.infer<typeof concludeWorkoutSchema>
