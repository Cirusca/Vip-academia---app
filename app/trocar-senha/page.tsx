import { Dumbbell } from "lucide-react"
import { TrocarSenhaForm } from "./client"

export default function TrocarSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Trocar Senha</h1>
            <p className="text-sm text-muted-foreground">
              Você precisa criar uma nova senha antes de continuar.
            </p>
          </div>
        </div>

        <TrocarSenhaForm />
      </div>
    </main>
  )
}
