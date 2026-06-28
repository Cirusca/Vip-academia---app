"use client"

import { useActionState } from "react"
import { forceChangePasswordAction } from "@/app/actions/user"

type State = { error?: string }

// Adapter: useActionState passes (prevState, formData); the server action only
// needs formData, so we drop prevState here.
async function formAction(_prev: State, formData: FormData): Promise<State> {
  return forceChangePasswordAction(formData)
}

export function TrocarSenhaForm() {
  const [state, dispatch, isPending] = useActionState(formAction, {})

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-foreground"
        >
          Nova senha
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {isPending ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  )
}
