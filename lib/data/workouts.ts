import "server-only"

/**
 * Fachada de acesso a dados de treino (server-only).
 *
 * `import "server-only"` faz o BUILD FALHAR se este módulo for importado num
 * client component — trava técnica do princípio "nada do backend fica no front".
 * A UI consome SOMENTE esta camada (tipos de view), nunca o Prisma direto.
 *
 * Todo acesso é escopado por `gymId` da SESSÃO (nunca do cliente) via
 * `tenantWhere` (RN-SEG / handoff §5). O `select` é explícito e não traz
 * `passwordHash` (não há User aqui, mas a regra vale para toda leitura).
 */

import type { WorkoutPlan } from "@/lib/types"
import type { SessionUser } from "@/lib/auth/session"
import { requireSession } from "@/lib/auth/session"
import { assertCan } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import { db, tenantWhere } from "@/lib/data/_scope"
import { MAX_PLANS_PER_PROFESSIONAL } from "@/lib/validation/limits"
import type { CreateWorkoutPlanInput } from "@/lib/validation/workoutPlan"
import { Prisma } from "@/lib/generated/prisma/client"
import { WorkoutPlanStatus } from "@/lib/generated/prisma/enums"

// `select` reutilizado para mapear um plano para a view (satisfies → o Prisma
// narra o tipo de retorno exatamente para estes campos).
const planViewSelect = {
  id: true,
  name: true,
  day: true,
  estDuration: true,
  estCalories: true,
  exercises: {
    orderBy: { order: "asc" },
    select: {
      name: true,
      sets: true,
      reps: true,
      rest: true,
      muscle: true,
      videoUrl: true,
      instructions: true,
      order: true,
    },
  },
} satisfies Prisma.WorkoutPlanSelect

// Linha do Prisma (apenas os campos que mapeamos para a view).
type PlanRow = {
  id: string
  name: string
  day: string | null
  estDuration: number | null
  estCalories: number | null
  exercises: {
    name: string
    sets: number
    reps: string
    rest: string
    muscle: string
    videoUrl: string | null
    instructions: string | null
    order: number
  }[]
}

/** Estimativa numérica → rótulo de view (RN-PLA-07). "" quando ausente. */
function label(value: number | null, unit: string): string {
  return value != null ? `${value} ${unit}` : ""
}

/** Mapeia o modelo canônico (Prisma) para o tipo de VIEW consumido pela UI. */
function toView(plan: PlanRow): WorkoutPlan {
  return {
    id: plan.id,
    name: plan.name,
    day: plan.day ?? "",
    duration: label(plan.estDuration, "min"),
    calories: label(plan.estCalories, "kcal"),
    exercises: plan.exercises.map((ex) => ({
      // `order` (1-based, único por plano) serve de id numérico estável na view.
      id: ex.order,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      muscle: ex.muscle,
      completed: false, // conclusão deriva de ExerciseLog (Fase 3); por ora false.
      videoUrl: ex.videoUrl ?? "",
      videoThumb: "",
      instructions: ex.instructions ?? "",
    })),
  }
}

/**
 * Núcleo: planos ATIVOS escopados por gymId da sessão. Recebe a sessão explícita
 * (testável). O wrapper `getWorkoutPlans()` resolve a sessão para a UI.
 */
export async function listWorkoutPlans(session: SessionUser): Promise<WorkoutPlan[]> {
  const plans = await db.workoutPlan.findMany({
    where: tenantWhere(session, { status: WorkoutPlanStatus.ativo }),
    orderBy: { createdAt: "asc" },
    select: planViewSelect,
  })
  return plans.map(toView)
}

/** Entrada da UI: resolve a sessão (gymId nunca do cliente) e delega ao núcleo. */
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const session = await requireSession()
  return listWorkoutPlans(session)
}

/**
 * Leitura por id com defesa anti-IDOR: a query já é escopada por gymId; em
 * seguida `assertCan` confere posse. Qualquer falha → `NotFoundError` (404):
 * recurso de outro tenant/dono é indistinguível de inexistente.
 */
export async function getWorkoutPlanById(
  session: SessionUser,
  id: string,
): Promise<WorkoutPlan> {
  const plan = await db.workoutPlan.findFirst({
    where: tenantWhere(session, { id }),
    select: { ...planViewSelect, gymId: true, createdBy: true },
  })
  if (!plan) throw new NotFoundError()
  assertCan(session, "workoutPlan:read", { gymId: plan.gymId, createdBy: plan.createdBy })
  return toView(plan)
}

/**
 * Cria um plano ESCOPADO pelo gym/dono da sessão. `order` dos exercícios é
 * atribuído a partir da posição (1-based) — o cliente não controla a ordem.
 *
 * Pré-condições de AUTORIZAÇÃO (papel) e VALIDAÇÃO (zod) são responsabilidade de
 * quem chama (a Server Action). Aqui impomos a quota RN-LIM-01 (contagem escopada,
 * só planos ativos) e carimbamos gymId/createdBy da sessão.
 */
export async function createWorkoutPlan(
  session: SessionUser,
  input: CreateWorkoutPlanInput,
): Promise<{ id: string }> {
  const activeCount = await db.workoutPlan.count({
    where: tenantWhere(session, {
      createdBy: session.userId,
      status: WorkoutPlanStatus.ativo,
    }),
  })
  if (activeCount >= MAX_PLANS_PER_PROFESSIONAL) {
    throw new Error(
      `Limite de ${MAX_PLANS_PER_PROFESSIONAL} planos ativos por profissional atingido.`,
    )
  }

  const created = await db.workoutPlan.create({
    data: {
      gymId: session.gymId, // tenant da sessão — nunca do input
      createdBy: session.userId, // dono = profissional autenticado
      name: input.name,
      day: input.day,
      estDuration: input.estDuration,
      estCalories: input.estCalories,
      level: input.level,
      exercises: {
        create: input.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          muscle: ex.muscle,
          videoUrl: ex.videoUrl,
          instructions: ex.instructions,
          order: i + 1,
        })),
      },
    },
    select: { id: true },
  })
  return created
}
