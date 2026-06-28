import "server-only"

/**
 * Fachada de acesso a dados do dashboard.
 *
 * `import "server-only"` impede que este módulo entre no bundle do cliente.
 * Hoje retorna mocks; na Fase 1, deriva de WorkoutLog/ExerciseLog reais,
 * sempre escopado por `gymId`/usuário da sessão. Assinaturas estáveis → a UI
 * não muda quando o backend entrar.
 */

import type {
  ActivityPoint,
  DashboardStat,
  RecentWorkout,
  WorkoutSummary,
} from "@/lib/types"
import {
  dashboardStats,
  recentWorkout,
  weeklyActivity,
  workoutSummaries,
} from "@/lib/mock-data/dashboard"

export async function getDashboardStats(): Promise<DashboardStat[]> {
  return dashboardStats
}

export async function getWeeklyActivity(): Promise<ActivityPoint[]> {
  return weeklyActivity
}

export async function getRecentWorkout(): Promise<RecentWorkout> {
  return recentWorkout
}

export async function getWorkoutSummaries(): Promise<WorkoutSummary[]> {
  return workoutSummaries
}
