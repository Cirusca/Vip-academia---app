import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

/**
 * Config do Vitest (unit, ambiente node).
 *
 * - alias `@/` → raiz, igual ao tsconfig.
 * - `server-only` é um stub vazio: o pacote real lança erro fora de um bundle
 *   RSC; nos testes de unidade só queremos exercitar a lógica pura.
 */
export default defineConfig({
  resolve: {
    alias: {
      "server-only": resolve(__dirname, "test/stubs/server-only.ts"),
      "@": resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
})
