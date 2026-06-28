import { describe, it, expect, vi, beforeEach } from "vitest"
import { NotFoundError } from "@/lib/auth/errors"

// Must mock before importing the module under test
vi.mock("@/lib/data/users", () => ({
  changePassword: vi.fn(),
}))

vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(),
}))

// "use server" modules reference next/cache etc.; stub out next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

// Mock Auth.js signOut — on success it triggers a NEXT_REDIRECT internally;
// in unit tests we just want to verify it was called with the right args.
vi.mock("@/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}))

// Mock isRedirectError so NEXT_REDIRECT simulation doesn't blow up tests
vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: vi.fn().mockReturnValue(false),
}))

import { changePasswordAction, forceChangePasswordAction } from "@/app/actions/user"
import { changePassword } from "@/lib/data/users"
import { requireSession } from "@/lib/auth/session"
import { signOut } from "@/auth"

const mockChangePassword = vi.mocked(changePassword)
const mockRequireSession = vi.mocked(requireSession)
const mockSignOut = vi.mocked(signOut)

const validSession = {
  userId: "user-123",
  gymId: "gym-abc",
  roles: ["profissional" as const],
  mustChangePassword: false,
}

// Sessão de usuário obrigado a trocar a senha (mustChangePassword=true).
const mustChangeSession = { ...validSession, mustChangePassword: true }

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v)
  }
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// changePasswordAction
// ---------------------------------------------------------------------------
describe("changePasswordAction", () => {
  it("retorna erro se não autenticado", async () => {
    mockRequireSession.mockRejectedValueOnce(new Error("Não autenticado."))

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).toEqual({ error: "Não autenticado." })
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("rejeita usuário com mustChangePassword=true (deve usar a tela forçada)", async () => {
    mockRequireSession.mockResolvedValueOnce(mustChangeSession)

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).toHaveProperty("error")
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("retorna erro de validação se campos inválidos (senhas não coincidem)", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
      confirmPassword: "DifferentPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).toHaveProperty("error")
    expect(result.error).toContain("coincidem")
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("retorna erro de validação se nova senha fraca (sem número)", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "weakpassword",
      confirmPassword: "weakpassword",
    })

    const result = await changePasswordAction(fd)

    expect(result).toHaveProperty("error")
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("retorna erro se NotFoundError (senha atual incorreta)", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)
    mockChangePassword.mockRejectedValueOnce(new NotFoundError())

    const fd = buildFormData({
      currentPassword: "WrongPass1",
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).toEqual({ error: "Senha atual incorreta." })
  })

  it("retorna {} em caso de sucesso", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)
    mockChangePassword.mockResolvedValueOnce(undefined)

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).toEqual({})
    expect(mockChangePassword).toHaveBeenCalledWith("user-123", {
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
    })
  })

  it("nunca retorna senha ou hash", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)
    mockChangePassword.mockResolvedValueOnce(undefined)

    const fd = buildFormData({
      currentPassword: "OldPass1",
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await changePasswordAction(fd)

    expect(result).not.toHaveProperty("password")
    expect(result).not.toHaveProperty("passwordHash")
    expect(result).not.toHaveProperty("currentPassword")
    expect(result).not.toHaveProperty("newPassword")
  })
})

// ---------------------------------------------------------------------------
// forceChangePasswordAction
// ---------------------------------------------------------------------------
describe("forceChangePasswordAction", () => {
  it("retorna erro se não autenticado", async () => {
    mockRequireSession.mockRejectedValueOnce(new Error("Não autenticado."))

    const fd = buildFormData({
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await forceChangePasswordAction(fd)

    expect(result).toEqual({ error: "Não autenticado." })
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("rejeita usuário sem mustChangePassword (não pode pular a senha atual)", async () => {
    mockRequireSession.mockResolvedValueOnce(validSession)

    const fd = buildFormData({
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    const result = await forceChangePasswordAction(fd)

    expect(result).toHaveProperty("error")
    expect(mockChangePassword).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it("retorna erro de validação se senhas não coincidem", async () => {
    mockRequireSession.mockResolvedValueOnce(mustChangeSession)

    const fd = buildFormData({
      newPassword: "NewPass1",
      confirmPassword: "DifferentPass1",
    })

    const result = await forceChangePasswordAction(fd)

    expect(result).toHaveProperty("error")
    expect(result.error).toContain("coincidem")
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it("chama signOut com redirectTo=/login em caso de sucesso (sem currentPassword)", async () => {
    mockRequireSession.mockResolvedValueOnce(mustChangeSession)
    mockChangePassword.mockResolvedValueOnce(undefined)

    const fd = buildFormData({
      newPassword: "NewPass1",
      confirmPassword: "NewPass1",
    })

    await forceChangePasswordAction(fd)

    // currentPassword must NOT be passed — forceChange skips current password check
    expect(mockChangePassword).toHaveBeenCalledWith("user-123", {
      newPassword: "NewPass1",
    })
    expect(mockChangePassword).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ currentPassword: expect.anything() }),
    )

    // CRITICAL: JWT stale com mustChangePassword=true deve ser descartado via signOut
    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: "/login" })
  })

  it("NÃO chama signOut se validação falhar", async () => {
    mockRequireSession.mockResolvedValueOnce(mustChangeSession)

    const fd = buildFormData({
      newPassword: "NewPass1",
      confirmPassword: "DifferentPass1",
    })

    await forceChangePasswordAction(fd)

    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
