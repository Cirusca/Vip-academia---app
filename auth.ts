import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"

/**
 * Instância Node do Auth.js v5 (Credentials + bcrypt + Prisma).
 *
 * - `session.strategy: "jwt"` vem da authConfig (gate no Edge).
 * - O adapter Prisma mantém as tabelas Auth.js para futura federação OAuth; com
 *   Credentials+jwt as sessões vivem no token, não no banco.
 * - `authorize` NUNCA confia no cliente: relê o User do banco, confere status e
 *   compara o hash bcrypt. Falha → null (mensagem genérica, anti-enumeração).
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Hash "isca" para igualar o tempo de resposta quando o e-mail não existe (ou não
// tem hash): sempre executamos UM bcrypt.compare, fechando o oráculo de timing
// que permitiria enumerar e-mails cadastrados. Não é segredo.
const DUMMY_HASH = "$2b$10$kXaX9t3gnfZMFWHpLw7Id.tIP6s9wfTCbzhauqaVHRFFPuC/HNq7G"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })

        // SEMPRE roda um bcrypt.compare (contra o hash real ou a isca) para que o
        // tempo de resposta não revele se o e-mail existe (anti-enumeração).
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

        // Falha fechada e genérica para todos os casos.
        if (!ok || !user?.passwordHash || user.status !== "ativo") return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          gymId: user.gymId,
          roles: user.roles,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
})
