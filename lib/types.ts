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
