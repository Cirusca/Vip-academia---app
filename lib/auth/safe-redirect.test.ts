import { describe, it, expect } from "vitest"
import { safeCallbackPath } from "@/lib/auth/safe-redirect"

describe("safeCallbackPath", () => {
  it("aceita caminho relativo same-origin", () => {
    expect(safeCallbackPath("/treinos")).toBe("/treinos")
    expect(safeCallbackPath("/configuracoes?tab=seguranca")).toBe("/configuracoes?tab=seguranca")
  })

  it("rejeita URL absoluta (open redirect)", () => {
    expect(safeCallbackPath("https://evil.com")).toBe("/")
    expect(safeCallbackPath("http://evil.com/x")).toBe("/")
  })

  it("rejeita protocol-relative // e /\\", () => {
    expect(safeCallbackPath("//evil.com")).toBe("/")
    expect(safeCallbackPath("/\\evil.com")).toBe("/")
  })

  it("rejeita vazio / nulo / não-caminho", () => {
    expect(safeCallbackPath("")).toBe("/")
    expect(safeCallbackPath(null)).toBe("/")
    expect(safeCallbackPath(undefined)).toBe("/")
    expect(safeCallbackPath("javascript:alert(1)")).toBe("/")
  })
})
