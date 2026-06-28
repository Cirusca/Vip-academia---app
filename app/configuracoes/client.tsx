"use client"

import { useActionState } from "react"
import { useTheme } from "next-themes"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { changePasswordAction } from "@/app/actions/user"
import { User, Shield, Palette, Mail, Key, Sun, Moon, Monitor } from "lucide-react"

type ChangePasswordState = { error?: string; success?: boolean }

// Adapter: useActionState passes (prevState, formData); server action only needs formData
async function changePasswordFormAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const result = await changePasswordAction(formData)
  if (result.error) return { error: result.error }
  return { success: true }
}

interface ConfiguracoesClientProps {
  name: string | null | undefined
  email: string | null | undefined
  roles: string[]
}

export function ConfiguracoesClient({ name, email, roles }: ConfiguracoesClientProps) {
  const [pwState, pwDispatch, pwPending] = useActionState(changePasswordFormAction, {})
  const { theme, setTheme } = useTheme()

  // Derive initials from name for avatar
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  // Derive human-readable role label
  const roleLabel = roles.includes("profissional")
    ? "Profissional"
    : roles.includes("aluno")
      ? "Aluno"
      : roles.join(", ") || "—"

  return (
    <AppLayout
      title="Configurações"
      subtitle="Gerencie suas preferências e configurações da conta"
    >
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="perfil">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: PERFIL ===== */}
        <TabsContent value="perfil">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Perfil do Usuário</CardTitle>
              <CardDescription>Suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{name ?? "—"}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {roleLabel}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    value={name ?? ""}
                    readOnly
                    className="bg-secondary border-border cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Perfil</label>
                  <Input
                    value={roleLabel}
                    readOnly
                    className="bg-secondary border-border cursor-default"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email ?? ""}
                      readOnly
                      className="bg-secondary border-border pl-9 cursor-default"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Para alterar nome ou email, entre em contato com o administrador da academia.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: SEGURANÇA ===== */}
        <TabsContent value="seguranca">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Segurança</CardTitle>
              <CardDescription>Altere sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Alterar Senha</p>
                    <p className="text-sm text-muted-foreground">
                      Atualize sua senha regularmente para maior segurança
                    </p>
                  </div>
                </div>

                <form action={pwDispatch} className="space-y-4">
                  {pwState?.error && (
                    <p
                      role="alert"
                      className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                      {pwState.error}
                    </p>
                  )}
                  {pwState?.success && (
                    <p
                      role="status"
                      className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
                    >
                      Senha alterada com sucesso.
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="currentPassword"
                        className="text-sm font-medium text-foreground"
                      >
                        Senha Atual
                      </label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-foreground"
                      >
                        Nova Senha
                      </label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-foreground"
                      >
                        Confirmar Nova Senha
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={pwPending}
                    className="bg-primary text-primary-foreground"
                  >
                    {pwPending ? "Salvando…" : "Atualizar Senha"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: APARÊNCIA ===== */}
        <TabsContent value="aparencia">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Aparência</CardTitle>
              <CardDescription>Escolha o tema da interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-foreground">Tema</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Sistema
                </Button>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Escuro
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {theme === "system"
                  ? "Tema segue a preferência do sistema operacional."
                  : theme === "dark"
                    ? "Tema escuro ativado."
                    : "Tema claro ativado."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
