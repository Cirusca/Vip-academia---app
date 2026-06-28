"use server"

import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/auth/session"
import { assignPlanSchema, revokeAssignmentSchema } from "@/lib/validation/assignment"
import { assignPlanToAluno, revokeAssignment } from "@/lib/data/assignments"

/**
 * Server Action = endpoint público (RN-SEG): requireSession() → zod.parse() →
 * fachada escopada. A autorização fina (posse do plano, aluno do mesmo gym)
 * acontece DENTRO de `assignPlanToAluno` via `assertCan` + re-busca escopada —
 * nada do cliente é confiado; `gymId`/`assignedBy` vêm da sessão.
 */
export async function assignPlanAction(raw: unknown) {
  const session = await requireSession()
  const input = assignPlanSchema.parse(raw)
  const { id } = await assignPlanToAluno(session, input)
  revalidatePath("/treinos")
  return { id }
}

export async function revokeAssignmentAction(raw: unknown) {
  const session = await requireSession()
  const input = revokeAssignmentSchema.parse(raw)
  await revokeAssignment(session, input)
  revalidatePath("/treinos")
}
