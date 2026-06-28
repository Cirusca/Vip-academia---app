import type { NextAuthConfig } from "next-auth"
import type { Role } from "@/lib/generated/prisma/enums"

type TokenClaims = {
  userId?: string
  gymId?: string
  roles?: Role[]
  mustChangePassword?: boolean
}

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const path = request.nextUrl.pathname
      const isOnLogin = path.startsWith("/login")
      const isOnTrocarSenha = path.startsWith("/trocar-senha")

      if (!isLoggedIn) {
        if (isOnLogin) return true
        return false
      }

      if (isOnLogin) return Response.redirect(new URL("/", request.nextUrl))

      if (auth.user.mustChangePassword && !isOnTrocarSenha) {
        return Response.redirect(new URL("/trocar-senha", request.nextUrl))
      }

      return true
    },

    jwt({ token, user }) {
      if (user) {
        const claims = token as TokenClaims
        claims.userId = user.id
        claims.gymId = user.gymId
        claims.roles = user.roles
        claims.mustChangePassword = user.mustChangePassword
      }
      return token
    },

    session({ session, token }) {
      const claims = token as TokenClaims
      if (session.user && claims.userId) {
        session.user.id = claims.userId
        session.user.gymId = claims.gymId ?? ""
        session.user.roles = claims.roles ?? []
        session.user.mustChangePassword = claims.mustChangePassword ?? false
      }
      return session
    },
  },
} satisfies NextAuthConfig
