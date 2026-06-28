import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { signIn } from "@/auth"

/**
 * Login mínimo (Credentials). Página standalone (sem sidebar). O `proxy.ts`
 * deixa `/login` passar; após autenticar, redireciona para "/".
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  async function authenticate(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      })
    } catch (err) {
      // signIn lança um redirect (NEXT_REDIRECT) no sucesso — só tratamos AuthError.
      if (err instanceof AuthError) {
        redirect("/login?error=1")
      }
      throw err
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">VIP Academia</h1>
            <p className="text-sm text-muted-foreground">Entre para continuar</p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            E-mail ou senha inválidos.
          </p>
        )}

        <form action={authenticate} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
