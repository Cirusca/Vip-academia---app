import { z } from "zod"

/**
 * Validador do payload de atribuição (RN-ATR). Os ids são apenas validados como
 * strings não-vazias: a AUTORIZAÇÃO real (posse do plano, aluno do mesmo gym) é
 * feita por re-busca escopada por `gymId` na camada de dados — nunca confiando
 * em ids vindos do cliente (anti-IDOR).
 */
const id = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`)

export const assignPlanSchema = z.object({
  workoutPlanId: id("Plano"),
  alunoId: id("Aluno"),
})
export type AssignPlanInput = z.infer<typeof assignPlanSchema>

export const revokeAssignmentSchema = z.object({
  assignmentId: id("Atribuição"),
})
export type RevokeAssignmentInput = z.infer<typeof revokeAssignmentSchema>
