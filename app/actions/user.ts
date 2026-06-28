"use server"

import { requireSession } from "@/lib/auth/session"
import { changePasswordSchema, forceChangePasswordSchema } from "@/lib/validation/user"
import { changePassword } from "@/lib/data/users"
import { NotFoundError } from "@/lib/auth/errors"
import { signOut } from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

/**
 * Troca voluntária de senha (aba de segurança em /configuracoes).
 * Exige senha atual (RN-SEG: anti-session-hijacking).
 *
 * Segurança:
 *  - userId vem EXCLUSIVAMENTE da sessão — nunca do cliente / formData.
 *  - NotFoundError → mensagem genérica (anti-enumeração / anti-IDOR).
 *  - Nunca retorna senha ou hash.
 */
export async function changePasswordAction(
  formData: FormData,
): Promise<{ error?: string }> {
  // 1. Autenticação — userId da sessão apenas
  let userId: string
  try {
    const session = await requireSession()
    userId = session.userId
  } catch {
    return { error: "Não autenticado." }
  }

  // 2. Validação via Zod
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Dados inválidos."
    return { error: firstError }
  }

  // 3. Alteração — userId sempre da sessão
  try {
    await changePassword(userId, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    })
  } catch (err) {
    if (err instanceof NotFoundError) {
      // Anti-enumeração: não revelar se usuário existe ou senha está errada
      return { error: "Senha atual incorreta." }
    }
    console.error("[changePasswordAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }

  // 4. Sucesso — nunca retorna senha ou hash
  return {}
}

/**
 * Troca forçada de senha (mustChangePassword=true → /trocar-senha).
 * Não exige senha atual — o admin já redefiniu no backend.
 *
 * Segurança: mesmas garantias de changePasswordAction, sem currentPassword.
 */
export async function forceChangePasswordAction(
  formData: FormData,
): Promise<{ error?: string }> {
  // 1. Autenticação — userId da sessão apenas
  let userId: string
  try {
    const session = await requireSession()
    userId = session.userId
  } catch {
    return { error: "Não autenticado." }
  }

  // 2. Validação via Zod
  const raw = {
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = forceChangePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Dados inválidos."
    return { error: firstError }
  }

  // 3. Alteração sem currentPassword
  try {
    await changePassword(userId, {
      newPassword: parsed.data.newPassword,
    })
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { error: "Erro ao alterar senha." }
    }
    console.error("[forceChangePasswordAction] erro inesperado:", err)
    return { error: "Erro interno. Tente novamente." }
  }

  // 4. Sucesso — invalida JWT stale (mustChangePassword=true) e redireciona para login
  try {
    await signOut({ redirectTo: "/login" })
  } catch (e) {
    if (isRedirectError(e)) throw e
    throw e
  }

  // Nunca alcançado (signOut lança NEXT_REDIRECT), mas satisfaz o tipo de retorno
  return {}
}
