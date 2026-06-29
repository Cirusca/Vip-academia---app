"use server"

import { requireSession } from "@/lib/auth/session"
import { acceptInviteSchema, endLinkSchema } from "@/lib/validation/link"
import { createInvite, acceptInvite, endLink } from "@/lib/data/links"
import { NotFoundError } from "@/lib/auth/errors"

type InviteResult = { inviteCode?: string; expiresAt?: Date; error?: string }

/**
 * Profissional gera código de convite (RN-VIN-02).
 * Retorna o código para exibição (ex.: copiar para WhatsApp).
 * O código NÃO vai para o client component como prop permanente — só exibição momentânea.
 */
export async function createInviteAction(_: FormData): Promise<InviteResult> {
  try {
    const session = await requireSession()
    const result = await createInvite(session)
    return { inviteCode: result.inviteCode, expiresAt: result.expiresAt }
  } catch {
    return { error: "Não foi possível gerar o convite. Tente novamente." }
  }
}

/** Aluno aceita convite pelo código de 8 caracteres (RN-VIN-09). */
export async function acceptInviteAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireSession()

    const raw = { code: formData.get("code") }
    const parsed = acceptInviteSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Código inválido." }
    }

    await acceptInvite(session, parsed.data)
    return {}
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Código inválido ou expirado. Verifique com seu profissional." }
    }
    console.error("[acceptInviteAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }
}

/** Qualquer das partes encerra o vínculo ativo (RN-VIN-05). */
export async function endLinkAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireSession()

    const raw = { linkId: formData.get("linkId") }
    const parsed = endLinkSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." }
    }

    await endLink(session, parsed.data)
    return {}
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Vínculo não encontrado ou já encerrado." }
    }
    console.error("[endLinkAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }
}
