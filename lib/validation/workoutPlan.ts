import { z } from "zod"
import { MAX_EXERCISES_PER_PLAN, MAX_SETS, MIN_SETS } from "@/lib/validation/limits"

/**
 * Validador do payload de criação de plano (reutilizável no SERVIDOR).
 * Regras: RN-PLA-03/04/05/06, RN-LIM-01, RN-INV-04.
 *
 * `order` NÃO entra no payload: é atribuído pelo servidor a partir da posição no
 * array (1-based), garantindo a unicidade `(workoutPlanId, order)` do banco e
 * impedindo o cliente de criar lacunas/colisões (RN-PLA-05).
 */

/** RN-PLA-06 — nível do plano. */
export const workoutLevelSchema = z.enum(["iniciante", "intermediário", "avançado"])
export type WorkoutLevel = z.infer<typeof workoutLevelSchema>

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`)

/** RN-PLA-04 / RN-INV-04 — um exercício do payload (sem `order`). */
export const exerciseInputSchema = z.object({
  name: nonEmpty("Nome do exercício"),
  sets: z
    .number()
    .int("Séries deve ser inteiro.")
    .min(MIN_SETS, `Séries deve ser ≥ ${MIN_SETS}.`)
    .max(MAX_SETS, `Séries deve ser ≤ ${MAX_SETS}.`),
  reps: nonEmpty("Repetições").max(20, "Faixa de repetições muito longa."),
  rest: nonEmpty("Descanso").max(20, "Descanso muito longo."),
  muscle: nonEmpty("Grupo muscular"),
  videoUrl: z.string().url("URL de vídeo inválida.").optional(),
  instructions: z.string().trim().max(2000, "Instruções muito longas.").optional(),
})
export type ExerciseInput = z.infer<typeof exerciseInputSchema>

/** RN-PLA-03 — plano válido tem nome + ≥1 exercício (e ≤ MAX por RN-LIM-01). */
export const createWorkoutPlanSchema = z.object({
  name: nonEmpty("Nome do plano").max(120, "Nome muito longo."),
  day: z.string().trim().max(40).optional(),
  estDuration: z.number().int().min(0).max(600).optional(), // minutos
  estCalories: z.number().int().min(0).max(10000).optional(), // kcal
  level: workoutLevelSchema.optional(),
  exercises: z
    .array(exerciseInputSchema)
    .min(1, "O plano precisa de ao menos 1 exercício.")
    .max(
      MAX_EXERCISES_PER_PLAN,
      `O plano pode ter no máximo ${MAX_EXERCISES_PER_PLAN} exercícios.`,
    ),
})
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>
