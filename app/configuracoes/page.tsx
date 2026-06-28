import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ConfiguracoesClient } from "./client"

/**
 * Página de configurações — Server Component.
 *
 * Obtém os dados do usuário autenticado via auth() (server-side) e repassa
 * apenas o necessário para o client component. Nunca expõe gymId, userId,
 * mustChangePassword ou hashes ao cliente.
 *
 * ROTA: /configuracoes
 */
export default async function ConfiguracoesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <ConfiguracoesClient
      name={session.user.name}
      email={session.user.email}
      roles={session.user.roles ?? []}
    />
  )
}
