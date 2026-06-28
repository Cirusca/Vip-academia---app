import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

/**
 * Proxy (Next 16 renomeou `middleware.ts` → `proxy.ts`). Roda no Edge usando a
 * config edge-safe (sem Prisma/bcrypt) e o callback `authorized` para o gate de
 * rotas. Export precisa se chamar `proxy` (convenção do Next 16).
 */
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Roda em tudo, menos: a API do Auth.js, internos do Next e qualquer arquivo
  // estático (caminho com extensão — ícones, manifest, imagens em /public).
  matcher: ["/((?!api/auth|_next|.*\\..*).*)"],
}
