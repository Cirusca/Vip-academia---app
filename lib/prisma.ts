import "server-only"

import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaNeon } from "@prisma/adapter-neon"

/**
 * Singleton do PrismaClient (server-only).
 *
 * Prisma 7 (generator `prisma-client`) exige um driver adapter em runtime — não
 * há mais query engine binário embutido. Escolhemos o adapter pela URL:
 *   - Neon serverless (prod) quando a connection string aponta para `neon.tech`;
 *   - `pg` (Postgres local do container) em desenvolvimento.
 *
 * O segredo (DATABASE_URL) é lido do ambiente — nunca versionado. Este módulo é
 * `server-only`: importá-lo de um client component quebra o build de propósito.
 */

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL ausente — defina no .env (server-only).")
}

const useNeon = /neon\.tech/.test(connectionString)

function makeClient() {
  const adapter = useNeon
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

// Reaproveita a instância entre hot-reloads do Next em dev (evita exaustão de pool).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? makeClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
