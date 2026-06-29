import { z } from "zod"

const id = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`)

/**
 * Profissional cria convite — sem payload do cliente (código gerado no servidor).
 * Exportado para completude (Server Action usa este schema como no-op de parse).
 */
export const createInviteSchema = z.object({})
export type CreateInviteInput = z.infer<typeof createInviteSchema>

/**
 * Aluno aceita convite: código de 8 hex maiúsculos gerado pelo servidor.
 * Normalização toUpperCase() facilita o aluno digitar sem caixa.
 */
export const acceptInviteSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9A-F]{8}$/, "Código inválido. Use o código de 8 caracteres recebido."),
})
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

/** Encerrar vínculo: só precisa do linkId. */
export const endLinkSchema = z.object({
  linkId: id("ID do vínculo"),
})
export type EndLinkInput = z.infer<typeof endLinkSchema>
