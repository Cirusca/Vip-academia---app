import "server-only"

/**
 * Fachada de acesso a dados de treino.
 *
 * `import "server-only"` faz o BUILD FALHAR se este módulo for importado num
 * componente de cliente — é a trava técnica do princípio "nada do backend fica
 * no front". Os componentes consomem SOMENTE esta camada; nunca o mock direto
 * nem (futuramente) o client do Prisma.
 *
 * Hoje retorna mocks. Na Fase 1, o corpo destas funções passa a consultar o
 * Prisma (filtrando por `gymId`/usuário da sessão) — a assinatura não muda, então
 * a UI não muda.
 */

import type { WorkoutPlan } from "@/lib/types"
import { workoutPlans } from "@/lib/mock-data/workouts"

export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  // TODO(Fase 1): prisma.workoutPlan.findMany({ where: { gymId }, ... })
  return workoutPlans
}
