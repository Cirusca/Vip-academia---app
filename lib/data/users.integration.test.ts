import "dotenv/config"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// Evita carregar next-auth: as funções recebem userId explícito.
vi.mock("@/auth", () => ({ auth: async () => null }))

import bcrypt from "bcryptjs"
import { db } from "@/lib/data/_scope"
import { changePassword } from "@/lib/data/users"
import { NotFoundError } from "@/lib/auth/errors"

const GYM_ID = "it3-gym"
const USER_ID = "it3-user"

const suite = process.env.DATABASE_URL ? describe : describe.skip

suite("changePassword", () => {
  beforeEach(async () => {
    await db.user.deleteMany({ where: { id: USER_ID } })
    // Cria usuário com senha conhecida e mustChangePassword=true
    const passwordHash = await bcrypt.hash("SenhaAtual123!", 10)
    await db.user.create({
      data: {
        id: USER_ID,
        email: "it3-user@x.dev",
        roles: ["aluno"],
        gymId: GYM_ID,
        passwordHash,
        mustChangePassword: true,
      },
    })
  })

  afterEach(async () => {
    await db.user.deleteMany({ where: { id: USER_ID } })
  })

  it("changePassword com senha atual correta atualiza hash e desliga flag", async () => {
    await changePassword(USER_ID, {
      currentPassword: "SenhaAtual123!",
      newPassword: "NovaSenha456@",
    })

    const user = await db.user.findUniqueOrThrow({
      where: { id: USER_ID },
      select: { passwordHash: true, mustChangePassword: true },
    })

    expect(user.mustChangePassword).toBe(false)
    expect(user.passwordHash).toBeTruthy()
    // O novo hash deve ser diferente do original
    const matches = await bcrypt.compare("NovaSenha456@", user.passwordHash!)
    expect(matches).toBe(true)
    // Senha antiga não deve casar
    const oldMatches = await bcrypt.compare("SenhaAtual123!", user.passwordHash!)
    expect(oldMatches).toBe(false)
  })

  it("changePassword com senha atual errada lança NotFoundError", async () => {
    await expect(
      changePassword(USER_ID, {
        currentPassword: "SenhaErrada999!",
        newPassword: "NovaSenha456@",
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it("changePassword force (sem currentPassword) atualiza hash e desliga flag", async () => {
    await changePassword(USER_ID, {
      newPassword: "ForceSenha789#",
    })

    const user = await db.user.findUniqueOrThrow({
      where: { id: USER_ID },
      select: { passwordHash: true, mustChangePassword: true },
    })

    expect(user.mustChangePassword).toBe(false)
    const matches = await bcrypt.compare("ForceSenha789#", user.passwordHash!)
    expect(matches).toBe(true)
  })

  it("changePassword userId inexistente lança NotFoundError", async () => {
    await expect(
      changePassword("id-inexistente-xyz", {
        currentPassword: "SenhaAtual123!",
        newPassword: "NovaSenha456@",
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
