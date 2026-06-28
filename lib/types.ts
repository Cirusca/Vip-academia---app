/**
 * Tipos de VIEW (consumidos pela UI via a fachada `lib/data/*`).
 *
 * ATENÇÃO: o modelo CANÔNICO de persistência está em
 * `docs/RELATORIO_DE_REQUISITOS.md` (Seção 6) e DIVERGE destes tipos de propósito.
 * No modelo canônico, por exemplo: `estDuration`/`estCalories` são numéricos,
 * `Exercise` tem `order` e NÃO tem `completed` (a conclusão deriva de `ExerciseLog`),
 * e há `gymId`/`createdBy`/`status`. A normalização para o modelo canônico acontece
 * na Fase 1/3, isolada dentro de `lib/data/*` — os componentes não mudam.
 */

export interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  rest: string
  muscle: string
  /** Mock/transitório — será derivado de ExerciseLog na Fase 3 (ver RN-EXE-02). */
  completed: boolean
  videoUrl: string
  videoThumb: string
  instructions: string
}

export interface WorkoutPlan {
  id: string
  name: string
  day: string
  duration: string
  calories: string
  exercises: Exercise[]
}

// ---------------------------------------------------------------------------
// Dashboard (home por aluno) — tipos de view.
// Ícones são passados como CHAVE (string serializável), não como componente,
// porque dados cruzam a fronteira servidor→cliente e componentes não serializam.
// ---------------------------------------------------------------------------

export type StatIconKey = "dumbbell" | "clock" | "flame" | "trending-up"

export interface DashboardStat {
  title: string
  value: string
  change: string
  icon: StatIconKey
}

export interface ActivityPoint {
  name: string
  treinos: number
  duracao: number
}

export interface WorkoutSummary {
  id: number
  name: string
  exercises: number
  duration: string
  calories: number
  level: string
  /** Classe Tailwind de cor (serializável). */
  color: string
  lastDone: string
}

export interface RecentExercise {
  name: string
  sets: number
  reps: string
  done: boolean
}

export interface RecentWorkout {
  name: string
  date: string
  duration: string
  calories: number
  level: string
  completed: boolean
  exercises: RecentExercise[]
}
