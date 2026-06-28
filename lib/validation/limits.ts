/**
 * Limites sãos do MVP (RN-LIM-01). Generosos e revisáveis.
 *
 * - MAX_EXERCISES_PER_PLAN: validável no próprio payload (array máx.).
 * - MAX_PLANS_PER_PROFESSIONAL: é uma CONTAGEM escopada por gymId (ignorando
 *   inativos) — imposta na Server Action (item 5), não no zod.
 */
export const MAX_EXERCISES_PER_PLAN = 30
export const MAX_PLANS_PER_PROFESSIONAL = 50

/** Faixas plausíveis por exercício (RN-LIM-01 / RN-PLA-04). */
export const MIN_SETS = 1
export const MAX_SETS = 20
