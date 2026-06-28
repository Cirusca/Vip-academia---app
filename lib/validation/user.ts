import { z } from "zod"

/**
 * Validadores de usuário (reutilizáveis no SERVIDOR; a validação no client é só
 * UX). Regras: docs/REGRAS_DE_NEGOCIO.md.
 */

/**
 * RN-USR-04 — senha: ≥ 8 caracteres, com ao menos 1 letra e 1 número.
 * (O hash bcrypt acontece na camada de auth, nunca aqui — aqui só validamos.)
 */
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter ao menos 1 letra.")
  .regex(/[0-9]/, "A senha deve conter ao menos 1 número.")

/** UFs válidas (para conferir o estado no CREF — RN-USR-05). */
export const BR_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

/**
 * RN-USR-05 — CREF: no MVP valida-se o FORMATO (número + UF). Aceita o formato
 * usual brasileiro `NNNNNN-C/UF` (C = G graduado / P provisionado, opcional),
 * normalizando para maiúsculas. A unicidade entre profissionais ativos é imposta
 * por índice parcial no banco; a verificação no Confef é débito conhecido.
 */
export const crefSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^\d{1,6}-?[GP]?\/[A-Z]{2}$/,
        "CREF inválido. Use o formato número/UF (ex.: 012345-G/SP).",
      )
      .refine((v) => {
        const uf = v.slice(-2)
        return (BR_UFS as readonly string[]).includes(uf)
      }, "UF do CREF inválida."),
  )
