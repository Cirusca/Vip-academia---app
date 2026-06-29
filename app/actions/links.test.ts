import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(),
}))
vi.mock("@/lib/data/links", () => ({
  createInvite: vi.fn(),
  acceptInvite: vi.fn(),
  endLink: vi.fn(),
}))

import { requireSession } from "@/lib/auth/session"
import { createInvite, acceptInvite, endLink } from "@/lib/data/links"
import { createInviteAction, acceptInviteAction, endLinkAction } from "@/app/actions/links"
import { NotFoundError } from "@/lib/auth/errors"

const profSession = { userId: "p1", gymId: "gym1", roles: ["profissional" as const], mustChangePassword: false }
const alunoSession = { userId: "a1", gymId: "gym1", roles: ["aluno" as const], mustChangePassword: false }

beforeEach(() => vi.clearAllMocks())

describe("createInviteAction", () => {
  it("profissional autenticado recebe inviteCode", async () => {
    vi.mocked(requireSession).mockResolvedValue(profSession)
    vi.mocked(createInvite).mockResolvedValue({ inviteCode: "A1B2C3D4", expiresAt: new Date() })

    const fd = new FormData()
    const result = await createInviteAction(fd)
    expect(result.inviteCode).toBe("A1B2C3D4")
    expect(result.error).toBeUndefined()
  })

  it("não autenticado → { error }", async () => {
    vi.mocked(requireSession).mockRejectedValue(new Error("não auth"))
    const fd = new FormData()
    const result = await createInviteAction(fd)
    expect(result.error).toBeTruthy()
  })
})

describe("acceptInviteAction", () => {
  it("código válido → sem erro", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(acceptInvite).mockResolvedValue(undefined)

    const fd = new FormData()
    fd.set("code", "A1B2C3D4")
    const result = await acceptInviteAction(fd)
    expect(result.error).toBeUndefined()
  })

  it("código inválido (formato) → erro de validação, data layer não chamada", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)

    const fd = new FormData()
    fd.set("code", "CURTO")
    const result = await acceptInviteAction(fd)
    expect(result.error).toBeTruthy()
    expect(vi.mocked(acceptInvite)).not.toHaveBeenCalled()
  })

  it("NotFoundError da data layer → mensagem genérica", async () => {
    vi.mocked(requireSession).mockResolvedValue(alunoSession)
    vi.mocked(acceptInvite).mockRejectedValue(new NotFoundError())

    const fd = new FormData()
    fd.set("code", "A1B2C3D4")
    const result = await acceptInviteAction(fd)
    expect(result.error).toMatch(/código|inválido|expirado/i)
  })
})

describe("endLinkAction", () => {
  it("sucesso → sem erro", async () => {
    vi.mocked(requireSession).mockResolvedValue(profSession)
    vi.mocked(endLink).mockResolvedValue(undefined)

    const fd = new FormData()
    fd.set("linkId", "clxyz123")
    const result = await endLinkAction(fd)
    expect(result.error).toBeUndefined()
  })

  it("NotFoundError → mensagem genérica", async () => {
    vi.mocked(requireSession).mockResolvedValue(profSession)
    vi.mocked(endLink).mockRejectedValue(new NotFoundError())

    const fd = new FormData()
    fd.set("linkId", "clxyz123")
    const result = await endLinkAction(fd)
    expect(result.error).toBeTruthy()
  })
})
