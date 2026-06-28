import type { NextAuthConfig } from "next-auth"
import type { Role } from "@/lib/generated/prisma/enums"

/**
 * Claims que carimbamos no JWT (e relemos na sessão). Tipamos explicitamente
 * porque a interface `JWT` do @auth/core não é augmentável por nome no pnpm.
 */
type TokenClaims = {
  userId?: string
  gymId?: string
  roles?: Role[]
}

/**
 * Configuração EDGE-SAFE do Auth.js v5 (sem Prisma/bcrypt) — usada pelo `proxy.ts`
 * (middleware no Edge). Os provedores reais (Credentials + bcrypt + Prisma) e o
 * adapter ficam em `auth.ts` (Node), que faz spread desta config.
 *
 * Decisão (REVISAO_PLANO_E_SEGURANCA 1.3): `session.strategy: "jwt"` — roles/gymId
 * viajam no TOKEN, permitindo o gate no Edge sem acesso ao banco.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // reais definidos em auth.ts (Node)
  callbacks: {
    // Gate de rotas (roda no Edge via proxy.ts). Protege tudo, exceto /login.
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = request.nextUrl.pathname.startsWith("/login")

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl))
        return true
      }
      return isLoggedIn // demais rotas exigem sessão (Auth.js redireciona ao signIn)
    },

    // gymId/roles SEMPRE do servidor → token (nunca do cliente). RN-SEG / handoff §5.
    jwt({ token, user }) {
      if (user) {
        const claims = token as TokenClaims
        claims.userId = user.id
        claims.gymId = user.gymId
        claims.roles = user.roles
      }
      return token
    },

    session({ session, token }) {
      const claims = token as TokenClaims
      if (session.user && claims.userId) {
        session.user.id = claims.userId
        session.user.gymId = claims.gymId ?? ""
        session.user.roles = claims.roles ?? []
      }
      return session
    },
  },
} satisfies NextAuthConfig
