/**
 * Dados MOCKADOS do dashboard (home do aluno).
 *
 * Extraídos dos componentes em `components/dashboard/*` (Fase 0). Fonte única;
 * na Fase 1 a fachada `lib/data` passa a derivar isto de `WorkoutLog`/`ExerciseLog`
 * reais (filtrados por gymId/sessão) e este arquivo é descartado.
 */

import type {
  ActivityPoint,
  DashboardStat,
  RecentWorkout,
  WorkoutSummary,
} from "@/lib/types"

export const dashboardStats: DashboardStat[] = [
  { title: "Treinos esta semana", value: "5", change: "+2 vs semana passada", icon: "dumbbell" },
  { title: "Duração média", value: "52min", change: "+8min vs semana passada", icon: "clock" },
  { title: "Calorias queimadas", value: "2.840", change: "kcal esta semana", icon: "flame" },
  { title: "Sequência atual", value: "12 dias", change: "Recorde pessoal: 18 dias", icon: "trending-up" },
]

export const weeklyActivity: ActivityPoint[] = [
  { name: "Seg", treinos: 1, duracao: 48 },
  { name: "Ter", treinos: 1, duracao: 55 },
  { name: "Qua", treinos: 0, duracao: 0 },
  { name: "Qui", treinos: 1, duracao: 60 },
  { name: "Sex", treinos: 1, duracao: 45 },
  { name: "Sáb", treinos: 1, duracao: 52 },
  { name: "Dom", treinos: 0, duracao: 0 },
]

export const recentWorkout: RecentWorkout = {
  name: "Treino B — Costas e Bíceps",
  date: "Hoje, 07:30",
  duration: "52 min",
  calories: 310,
  level: "Intermediário",
  completed: true,
  exercises: [
    { name: "Puxada frontal", sets: 4, reps: "12", done: true },
    { name: "Remada curvada", sets: 4, reps: "10", done: true },
    { name: "Remada unilateral", sets: 3, reps: "12", done: true },
    { name: "Rosca direta", sets: 3, reps: "12", done: true },
    { name: "Rosca martelo", sets: 3, reps: "10", done: true },
    { name: "Rosca concentrada", sets: 3, reps: "12", done: false },
  ],
}

export const workoutSummaries: WorkoutSummary[] = [
  { id: 1, name: "Treino A — Peito e Tríceps", exercises: 8, duration: "45 min", calories: 320, level: "Intermediário", color: "bg-primary", lastDone: "há 3 dias" },
  { id: 2, name: "Treino B — Costas e Bíceps", exercises: 7, duration: "50 min", calories: 280, level: "Intermediário", color: "bg-blue-500", lastDone: "Hoje" },
  { id: 3, name: "Treino C — Pernas Completo", exercises: 10, duration: "60 min", calories: 450, level: "Avançado", color: "bg-red-500", lastDone: "há 5 dias" },
]
