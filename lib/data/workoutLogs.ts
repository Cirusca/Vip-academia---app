import "server-only"

import type { SessionUser } from "@/lib/auth/session"
import { isProfissional, isAluno } from "@/lib/auth/session"
import { assertCan } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import { db, tenantWhere } from "@/lib/data/_scope"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  AssignmentStatus,
  LinkStatus,
  WorkoutLogStatus,
  WorkoutPlanStatus,
} from "@/lib/generated/prisma/enums"
import type {
  StartWorkoutInput,
  UpdateExerciseLogInput,
  ConcludeWorkoutInput,
} from "@/lib/validation/workoutLog"

// ── Tipos de view ──────────────────────────────────────────────────────────

export type ExerciseLogView = {
  id: string
  name: string
  sets: number
  reps: string
  rest: string
  muscle: string
  videoUrl: string | null
  instructions: string | null
  order: number
  completed: boolean
}

export type WorkoutLogView = {
  id: string
  workoutPlanId: string
  workoutPlanName: string | null
  status: WorkoutLogStatus
  date: Date | null
  startedAt: Date
  concludedAt: Date | null
  durationMin: number | null
  caloriesBurned: number | null
  exerciseLogs: ExerciseLogView[]
}

export type ProgressMetrics = {
  totalWorkouts: number
  totalCalories: number
  totalDurationMin: number
  streak: number
}

// ── Helpers internos ────────────────────────────────────────────────────────

const workoutLogViewSelect = {
  id: true,
  workoutPlanId: true,
  workoutPlan: { select: { name: true } },
  status: true,
  date: true,
  startedAt: true,
  concludedAt: true,
  durationMin: true,
  caloriesBurned: true,
  exerciseLogs: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      name: true,
      sets: true,
      reps: true,
      rest: true,
      muscle: true,
      videoUrl: true,
      instructions: true,
      order: true,
      completed: true,
    },
  },
} satisfies Prisma.WorkoutLogSelect

type WorkoutLogRow = Prisma.WorkoutLogGetPayload<{ select: typeof workoutLogViewSelect }>

function toView(log: WorkoutLogRow): WorkoutLogView {
  return {
    id: log.id,
    workoutPlanId: log.workoutPlanId,
    workoutPlanName: log.workoutPlan?.name ?? null,
    status: log.status,
    date: log.date,
    startedAt: log.startedAt,
    concludedAt: log.concludedAt,
    durationMin: log.durationMin,
    caloriesBurned: log.caloriesBurned,
    exerciseLogs: log.exerciseLogs,
  }
}

/** Converte Date de UTC para string YYYY-MM-DD no fuso America/Sao_Paulo. */
function saoPauloDateStr(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

function subtractDayStr(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00.000Z")
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// ── Streak ──────────────────────────────────────────────────────────────────

/**
 * Calcula streak de dias consecutivos com treino concluído (RN-EXE-06).
 * O dia corrente é "pendente": se hoje não houver treino, conta a partir de ontem.
 * Exportada para unit tests isolados.
 */
export function calcStreak(concludedDates: Date[], now: Date): number {
  if (concludedDates.length === 0) return 0

  const dateSet = new Set(concludedDates.map(d => d.toISOString().slice(0, 10)))
  const sorted = [...dateSet].sort().reverse() // mais recente primeiro

  const todayStr = saoPauloDateStr(now)
  const yesterdayStr = subtractDayStr(todayStr)

  // Se o treino mais recente não é hoje nem ontem, não há streak ativo.
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0

  let streak = 0
  let expected = sorted[0]
  for (const d of sorted) {
    if (d === expected) {
      streak++
      expected = subtractDayStr(expected)
    } else {
      break
    }
  }
  return streak
}

// ── Execução ─────────────────────────────────────────────────────────────────

/**
 * Inicia uma sessão de treino: cria WorkoutLog(em_andamento) + snapshot de
 * ExerciseLogs dos exercícios do plano no instante atual (RN-EXE-09).
 *
 * Idempotente: se já existe log em_andamento para o par (aluno, plano),
 * devolve o existente — suporta recuperação após queda (RN-EXE-11).
 *
 * Pré-condições verificadas: papel aluno; atribuição ativa; plano no mesmo gym.
 */
export async function startWorkout(
  session: SessionUser,
  input: StartWorkoutInput,
): Promise<WorkoutLogView> {
  if (!isAluno(session)) throw new NotFoundError()

  // Validar atribuição ativa
  const assignment = await db.assignment.findFirst({
    where: tenantWhere(session, {
      workoutPlanId: input.workoutPlanId,
      alunoId: session.userId,
      status: AssignmentStatus.ativa,
    }),
    select: { id: true },
  })
  if (!assignment) throw new NotFoundError()

  // Idempotência: devolver log em_andamento existente (RN-EXE-11)
  const existing = await db.workoutLog.findFirst({
    where: tenantWhere(session, {
      workoutPlanId: input.workoutPlanId,
      alunoId: session.userId,
      status: WorkoutLogStatus.em_andamento,
    }),
    select: workoutLogViewSelect,
  })
  if (existing) return toView(existing)

  // Carregar plano com exercícios para snapshot (captura o estado atual — RN-EXE-09)
  const plan = await db.workoutPlan.findFirst({
    where: tenantWhere(session, { id: input.workoutPlanId, status: WorkoutPlanStatus.ativo }),
    select: {
      estCalories: true,
      exercises: {
        orderBy: { order: "asc" },
        select: {
          name: true, sets: true, reps: true, rest: true, muscle: true,
          videoUrl: true, instructions: true, order: true,
        },
      },
    },
  })
  if (!plan) throw new NotFoundError()

  const log = await db.workoutLog.create({
    data: {
      gymId: session.gymId,
      alunoId: session.userId,
      workoutPlanId: input.workoutPlanId,
      status: WorkoutLogStatus.em_andamento,
      caloriesBurned: plan.estCalories,
      exerciseLogs: { create: plan.exercises },
    },
    select: workoutLogViewSelect,
  })
  return toView(log)
}

/**
 * Marca ou desmarca um exercício como concluído durante a execução (RN-EXE-02).
 * Rejeita se o WorkoutLog já foi concluído (RN-EXE-07 / imutabilidade).
 */
export async function updateExerciseLog(
  session: SessionUser,
  input: UpdateExerciseLogInput,
): Promise<void> {
  const exLog = await db.exerciseLog.findFirst({
    where: { id: input.exerciseLogId },
    select: {
      id: true,
      workoutLog: { select: { id: true, gymId: true, alunoId: true, status: true } },
    },
  })
  if (!exLog) throw new NotFoundError()

  assertCan(session, "workoutLog:update", {
    gymId: exLog.workoutLog.gymId,
    createdBy: exLog.workoutLog.alunoId,
  })
  // Status check: log já concluído é imutável (RN-EXE-07/10)
  if (exLog.workoutLog.status !== WorkoutLogStatus.em_andamento) throw new NotFoundError()

  await db.exerciseLog.update({
    where: { id: exLog.id },
    data: { completed: input.completed },
  })
}

/**
 * Conclui o treino: fecha o WorkoutLog, calcula durationMin e define date
 * no fuso America/Sao_Paulo (RN-EXE-04/06, RN-INV-05).
 * Após conclusão, o log é imutável — nova chamada lança NotFoundError (RN-EXE-07/10).
 * `now` é injetável para testes.
 */
export async function concludeWorkout(
  session: SessionUser,
  input: ConcludeWorkoutInput,
  now: Date = new Date(),
): Promise<WorkoutLogView> {
  const log = await db.workoutLog.findFirst({
    where: tenantWhere(session, {
      id: input.workoutLogId,
      alunoId: session.userId,
      status: WorkoutLogStatus.em_andamento,
    }),
    select: { id: true, startedAt: true },
  })
  if (!log) throw new NotFoundError()

  const durationMin = Math.max(0, Math.round((now.getTime() - log.startedAt.getTime()) / 60_000))
  const localDateStr = saoPauloDateStr(now)
  const date = new Date(localDateStr + "T00:00:00.000Z")

  const updated = await db.workoutLog.update({
    where: { id: log.id },
    data: { status: WorkoutLogStatus.concluido, concludedAt: now, durationMin, date },
    select: workoutLogViewSelect,
  })
  return toView(updated)
}

/** Lê um WorkoutLog com exerciseLogs; verifica posse (anti-IDOR). */
export async function getWorkoutLog(
  session: SessionUser,
  workoutLogId: string,
): Promise<WorkoutLogView> {
  const log = await db.workoutLog.findFirst({
    where: tenantWhere(session, { id: workoutLogId, alunoId: session.userId }),
    select: workoutLogViewSelect,
  })
  if (!log) throw new NotFoundError()
  return toView(log)
}

/** Histórico de treinos concluídos do aluno, do mais recente ao mais antigo. */
export async function listWorkoutHistory(session: SessionUser): Promise<WorkoutLogView[]> {
  if (!isAluno(session)) throw new NotFoundError()

  const logs = await db.workoutLog.findMany({
    where: tenantWhere(session, { alunoId: session.userId, status: WorkoutLogStatus.concluido }),
    orderBy: { date: "desc" },
    select: workoutLogViewSelect,
  })
  return logs.map(toView)
}

/** Métricas de progresso do aluno: treinos, calorias, tempo, streak (RN-EXE-05/06). */
export async function getProgressMetrics(session: SessionUser): Promise<ProgressMetrics> {
  if (!isAluno(session)) throw new NotFoundError()

  const logs = await db.workoutLog.findMany({
    where: tenantWhere(session, { alunoId: session.userId, status: WorkoutLogStatus.concluido }),
    select: { durationMin: true, caloriesBurned: true, date: true },
    orderBy: { date: "desc" },
  })

  const totalWorkouts = logs.length
  const totalCalories = logs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0)
  const totalDurationMin = logs.reduce((s, l) => s + (l.durationMin ?? 0), 0)
  const dates = logs.map(l => l.date).filter((d): d is Date => d !== null)
  const streak = calcStreak(dates, new Date())

  return { totalWorkouts, totalCalories, totalDurationMin, streak }
}

/**
 * Profissional lê métricas de progresso de um aluno vinculado (RN-EXE-08 / RN-SEG-03).
 * Exige link ativo entre o profissional e o aluno-alvo (anti-IDOR).
 */
export async function getAlunoProgress(
  session: SessionUser,
  alunoId: string,
): Promise<ProgressMetrics> {
  if (!isProfissional(session)) throw new NotFoundError()

  const link = await db.link.findFirst({
    where: tenantWhere(session, {
      professionalId: session.userId,
      alunoId,
      status: LinkStatus.ativo,
    }),
    select: { id: true },
  })
  if (!link) throw new NotFoundError()

  const logs = await db.workoutLog.findMany({
    where: tenantWhere(session, { alunoId, status: WorkoutLogStatus.concluido }),
    select: { durationMin: true, caloriesBurned: true, date: true },
    orderBy: { date: "desc" },
  })

  const totalWorkouts = logs.length
  const totalCalories = logs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0)
  const totalDurationMin = logs.reduce((s, l) => s + (l.durationMin ?? 0), 0)
  const dates = logs.map(l => l.date).filter((d): d is Date => d !== null)
  const streak = calcStreak(dates, new Date())

  return { totalWorkouts, totalCalories, totalDurationMin, streak }
}
