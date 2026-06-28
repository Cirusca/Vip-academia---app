import "server-only"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { NotFoundError } from "@/lib/auth/errors"

/**
 * Altera a senha de um usuário.
 *
 * Segurança (RN-SEG / anti-IDOR):
 *  - `userId` vem SEMPRE da sessão — nunca do cliente.
 *  - Se `currentPassword` for fornecida, verifica o hash antes de alterar.
 *    Usuário não encontrado OU senha errada → NotFoundError (anti-enumeração).
 *  - Nunca retorna nem expõe o hash de senha.
 *  - Ao final, desliga `mustChangePassword`.
 */
export async function changePassword(
  userId: string,
  opts: { currentPassword?: string; newPassword: string },
): Promise<void> {
  // Busca o usuário com o hash (campo excluído do select default por RN-SEG).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  })

  if (!user) {
    throw new NotFoundError()
  }

  // Se currentPassword foi informada, verifica antes de prosseguir.
  if (opts.currentPassword !== undefined) {
    const hashToCheck = user.passwordHash ?? ""
    const valid = await bcrypt.compare(opts.currentPassword, hashToCheck)
    if (!valid) {
      throw new NotFoundError()
    }
  }

  const newHash = await bcrypt.hash(opts.newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  })
}
