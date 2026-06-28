import "dotenv/config"
import { defineConfig } from "prisma/config"

/**
 * Configuração do Prisma 7 (substitui url/directUrl do bloco datasource).
 *
 * - `migrate`/introspection usam a conexão DIRECT (DIRECT_URL — sem "-pooler").
 * - Em runtime, o PrismaClient recebe um `adapter` (Neon em prod; pg local em dev).
 *
 * Segredos: lidos do .env (gitignored). Nada de URL/segredo no schema versionado.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
})
