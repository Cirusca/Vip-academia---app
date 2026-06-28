import { describe, it, expect } from "vitest"
import { passwordSchema, crefSchema } from "@/lib/validation/user"
import {
  createWorkoutPlanSchema,
  exerciseInputSchema,
} from "@/lib/validation/workoutPlan"
import { isNotFutureInSaoPaulo, toSaoPauloYMD } from "@/lib/validation/date"
import { MAX_EXERCISES_PER_PLAN } from "@/lib/validation/limits"

describe("passwordSchema (RN-USR-04)", () => {
  it("aceita ≥8 com letra e número", () => {
    expect(passwordSchema.safeParse("abc12345").success).toBe(true)
  })
  it("rejeita curta", () => {
    expect(passwordSchema.safeParse("ab12").success).toBe(false)
  })
  it("rejeita sem número", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false)
  })
  it("rejeita sem letra", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false)
  })
})

describe("crefSchema (RN-USR-05)", () => {
  it("aceita formato com categoria e normaliza maiúsculas", () => {
    const r = crefSchema.safeParse("012345-g/sp")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("012345-G/SP")
  })
  it("aceita sem categoria", () => {
    expect(crefSchema.safeParse("12345/RJ").success).toBe(true)
  })
  it("rejeita UF inexistente", () => {
    expect(crefSchema.safeParse("12345/ZZ").success).toBe(false)
  })
  it("rejeita sem UF", () => {
    expect(crefSchema.safeParse("12345").success).toBe(false)
  })
})

const validExercise = {
  name: "Supino",
  sets: 4,
  reps: "8-12",
  rest: "60s",
  muscle: "Peito",
}

describe("createWorkoutPlanSchema (RN-PLA-03/04, RN-LIM-01)", () => {
  it("aceita plano com nome + 1 exercício", () => {
    const r = createWorkoutPlanSchema.safeParse({
      name: "Treino A",
      exercises: [validExercise],
    })
    expect(r.success).toBe(true)
  })
  it("rejeita sem exercícios", () => {
    expect(
      createWorkoutPlanSchema.safeParse({ name: "Treino A", exercises: [] }).success,
    ).toBe(false)
  })
  it("rejeita nome vazio", () => {
    expect(
      createWorkoutPlanSchema.safeParse({ name: "  ", exercises: [validExercise] })
        .success,
    ).toBe(false)
  })
  it(`rejeita > ${MAX_EXERCISES_PER_PLAN} exercícios`, () => {
    const many = Array.from({ length: MAX_EXERCISES_PER_PLAN + 1 }, () => validExercise)
    expect(
      createWorkoutPlanSchema.safeParse({ name: "T", exercises: many }).success,
    ).toBe(false)
  })
  it("rejeita sets < 1 (RN-INV-04)", () => {
    expect(exerciseInputSchema.safeParse({ ...validExercise, sets: 0 }).success).toBe(
      false,
    )
  })
})

describe("data não-futura em São Paulo (RN-INV-02/05)", () => {
  const now = new Date("2026-06-28T12:00:00Z") // SP: 2026-06-28 09:00

  it("formata YMD no fuso de SP", () => {
    expect(toSaoPauloYMD(now)).toBe("2026-06-28")
  })
  it("aceita mesmo dia-calendário ainda que instante futuro", () => {
    const later = new Date("2026-06-28T23:00:00Z") // SP 20:00 mesmo dia
    expect(isNotFutureInSaoPaulo(later, now)).toBe(true)
  })
  it("rejeita dia seguinte", () => {
    const tomorrow = new Date("2026-06-29T12:00:00Z")
    expect(isNotFutureInSaoPaulo(tomorrow, now)).toBe(false)
  })
  it("aceita dia anterior", () => {
    const yesterday = new Date("2026-06-27T12:00:00Z")
    expect(isNotFutureInSaoPaulo(yesterday, now)).toBe(true)
  })
})
