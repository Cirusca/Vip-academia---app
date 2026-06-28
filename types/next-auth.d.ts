import type { Role } from "@/lib/generated/prisma/enums"
import type { DefaultSession } from "next-auth"

/**
 * Augmentação dos tipos do Auth.js para carregar `gymId`/`roles` na sessão
 * (derivados do servidor; nunca do cliente).
 *
 * Obs.: a interface `JWT` vive em `@auth/core/jwt` (dep transitiva, não
 * resolvível por nome no pnpm), então não a augmentamos aqui — os callbacks
 * tipam o payload do token via `TokenClaims` (ver auth.config.ts).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      gymId: string
      roles: Role[]
    } & DefaultSession["user"]
  }

  interface User {
    gymId: string
    roles: Role[]
  }
}
