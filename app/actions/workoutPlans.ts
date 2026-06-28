"use server"

import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/auth/session"
import { assertCan } from "@/lib/auth/assertCan"
import { createWorkoutPlanSchema, updateWorkoutPlanSchema, deleteWorkoutPlanSchema } from "@/lib/validation/workoutPlan"
import { createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from "@/lib/data/workouts"

/**
 * Server Action = endpoint público. A ordem é inegociável (RN-SEG):
 *   requireSession() → assertCan() → zod.parse() → escrita escopada.
 * Nada do cliente é confiado: gymId/createdBy vêm da sessão; o payload é validado.
 */
export async function createWorkoutPlanAction(raw: unknown) {
  const session = await requireSession()
  assertCan(session, "workoutPlan:create") // só profissional; senão 404
  const input = createWorkoutPlanSchema.parse(raw)
  const { id } = await createWorkoutPlan(session, input)
  revalidatePath("/treinos")
  return { id }
}

export async function updateWorkoutPlanAction(raw: unknown) {
  const session = await requireSession()
  const input = updateWorkoutPlanSchema.parse(raw)
  const updated = await updateWorkoutPlan(session, input)
  revalidatePath("/treinos")
  return { id: updated.id }
}

export async function deleteWorkoutPlanAction(raw: unknown) {
  const session = await requireSession()
  const input = deleteWorkoutPlanSchema.parse(raw)
  await deleteWorkoutPlan(session, input)
  revalidatePath("/treinos")
}
