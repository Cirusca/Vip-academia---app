import { AppLayout } from "@/components/app-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { WorkoutList } from "@/components/dashboard/workout-list"
import {
  getDashboardStats,
  getRecentWorkout,
  getWeeklyActivity,
  getWorkoutSummaries,
} from "@/lib/data/dashboard"

/**
 * Dashboard (home) — SERVER COMPONENT.
 *
 * Busca os dados no servidor via a fachada `lib/data` (hoje mock, amanhã Prisma
 * escopado por gymId/sessão) e passa por props aos componentes. Nenhum dado é
 * embutido nos componentes de cliente.
 */
export default async function DashboardPage() {
  const [stats, activity, recentWorkout, summaries] = await Promise.all([
    getDashboardStats(),
    getWeeklyActivity(),
    getRecentWorkout(),
    getWorkoutSummaries(),
  ])

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Aqui está o resumo dos seus treinos recentes."
    >
      {/* Métricas de treino */}
      <StatsCards stats={stats} />

      {/* Gráfico de duração + Último treino lado a lado */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <ActivityChart data={activity} />
        <RecentActivity workout={recentWorkout} />
      </div>

      {/* Lista de treinos com botão de criar */}
      <WorkoutList workouts={summaries} compact />
    </AppLayout>
  )
}
