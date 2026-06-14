"use client"

import { AppLayout } from "@/components/app-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { WorkoutList } from "@/components/dashboard/workout-list"

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Aqui está o resumo dos seus treinos recentes."
    >
      {/* Métricas de treino */}
      <StatsCards />

      {/* Gráfico de duração + Último treino lado a lado */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <ActivityChart />
        <RecentActivity />
      </div>

      {/* Lista de treinos com botão de criar */}
      <WorkoutList compact />
    </AppLayout>
  )
}
