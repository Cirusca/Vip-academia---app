"use server"

import { signOut } from "@/auth"

/** Encerra a sessão e volta ao login. Usada pelo botão "Sair" da sidebar. */
export async function logout() {
  await signOut({ redirectTo: "/login" })
}
