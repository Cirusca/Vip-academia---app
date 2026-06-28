import "server-only"

/**
 * Fachada de acesso a dados de ATRIBUIÇÕES (server-only) — Fase 2 / RN-ATR.
 *
 * Mesmas garantias da fachada de treinos: toda query escopada por `gymId` da
 * SESSÃO (`tenantWhere`), nunca de input do cliente; autorização fina via
 * `assertCan`; falhas → `NotFoundError` (404, anti-IDOR). O Prisma só é tocado
 * aqui dentro (via `db` de `_scope`).
 */

import type { SessionUser } from "@/lib/auth/session"
import { assertCan } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import { db, tenantWhere } from "@/lib/data/_scope"
import { Prisma } from "@/lib/generated/prisma/client"
import { AssignmentStatus, UserStatus, WorkoutPlanStatus, Role } from "@/lib/generated/prisma/enums"
import type { AssignPlanInput, RevokeAssignmentInput } from "@/lib/validation/assignment"

/**
 * Atribui um plano (do profissional) a um aluno do MESMO gym. Idempotente:
 * reatribuir um par já ativo é no-op (RN-ATR-08) — retorna a atribuição existente.
 *
 * Ordem de defesa (RN-SEG):
 *   1) plano existe no gym e pertence ao profissional (assertCan assignment:create);
 *   2) aluno-alvo existe no MESMO gym, ativo e com papel aluno (senão 404);
 *   3) cria — ou devolve a ativa existente (índice parcial protege a corrida).
 */
export async function assignPlanToAluno(
  session: SessionUser,
  input: AssignPlanInput,
): Promise<{ id: string }> {
  // 1) Plano-alvo: precisa existir no gym, estar ativo e pertencer ao profissional.
  const plan = await db.workoutPlan.findFirst({
    where: tenantWhere(session, {
      id: input.workoutPlanId,
      status: WorkoutPlanStatus.ativo,
    }),
    select: { gymId: true, createdBy: true },
  })
  if (!plan) throw new NotFoundError()
  assertCan(session, "assignment:create", { gymId: plan.gymId, createdBy: plan.createdBy })

  // 2) Aluno-alvo: mesmo gym (tenantWhere), ativo e com papel aluno. Qualquer
  //    desvio é indistinguível de inexistente. (Gate de vínculo ativo: Fase 3.)
  const aluno = await db.user.findFirst({
    where: tenantWhere(session, {
      id: input.alunoId,
      status: UserStatus.ativo,
      roles: { has: Role.aluno },
    }),
    select: { id: true },
  })
  if (!aluno) throw new NotFoundError()

  // 3) Idempotência (RN-ATR-08): se já há atribuição ativa do par, é no-op.
  const existing = await db.assignment.findFirst({
    where: tenantWhere(session, {
      workoutPlanId: input.workoutPlanId,
      alunoId: input.alunoId,
      status: AssignmentStatus.ativa,
    }),
    select: { id: true },
  })
  if (existing) return existing

  try {
    return await db.assignment.create({
      data: {
        gymId: session.gymId, // tenant da sessão — nunca do input
        workoutPlanId: input.workoutPlanId,
        alunoId: input.alunoId,
        assignedBy: session.userId, // quem atribuiu = profissional autenticado
        status: AssignmentStatus.ativa,
      },
      select: { id: true },
    })
  } catch (e) {
    // Corrida: o índice parcial único rejeitou um 2o "ativa" do par. Trata como
    // no-op idempotente e devolve a atribuição ativa vencedora.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const won = await db.assignment.findFirst({
        where: tenantWhere(session, {
          workoutPlanId: input.workoutPlanId,
          alunoId: input.alunoId,
          status: AssignmentStatus.ativa,
        }),
        select: { id: true },
      })
      if (won) return won
    }
    throw e
  }
}

/**
 * Pausa (revoga) uma atribuição ativa — RN-ATR-05/07. Exige ser o profissional
 * que a fez (assertCan assignment:revoke). No-op se já não estiver ativa.
 */
export async function revokeAssignment(
  session: SessionUser,
  input: RevokeAssignmentInput,
): Promise<void> {
  const assignment = await db.assignment.findFirst({
    where: tenantWhere(session, { id: input.assignmentId }),
    select: { id: true, gymId: true, assignedBy: true, status: true },
  })
  if (!assignment) throw new NotFoundError()
  assertCan(session, "assignment:revoke", {
    gymId: assignment.gymId,
    createdBy: assignment.assignedBy,
  })

  if (assignment.status !== AssignmentStatus.ativa) return // idempotente

  await db.assignment.update({
    where: { id: assignment.id },
    data: { status: AssignmentStatus.pausada },
  })
}
