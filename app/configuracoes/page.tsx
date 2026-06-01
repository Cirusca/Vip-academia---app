/**
 * ============================================================================
 * FITPRO ACADEMIA - PAGINA DE CONFIGURACOES
 * ============================================================================
 * 
 * Pagina de configuracoes gerais do sistema.
 * Permite personalizar preferencias, gerenciar conta e ajustar parametros.
 * 
 * SECOES DE CONFIGURACAO:
 * 
 * 1. PERFIL DO USUARIO
 *    - Dados pessoais (nome, email, telefone)
 *    - Foto de perfil
 *    - Cargo e permissoes
 * 
 * 2. CONFIGURACOES DA ACADEMIA
 *    - Nome e logo da academia
 *    - Horario de funcionamento
 *    - Endereco e contato
 * 
 * 3. NOTIFICACOES
 *    - Alertas por email
 *    - Notificacoes push
 *    - Lembretes de agendamento
 * 
 * 4. SEGURANCA
 *    - Alteracao de senha
 *    - Autenticacao de dois fatores
 *    - Sessoes ativas
 * 
 * 5. INTEGRACAO
 *    - Conectar apps externos
 *    - API keys
 *    - Webhooks
 * 
 * 6. APARENCIA
 *    - Tema (claro/escuro)
 *    - Idioma
 *    - Formato de data/hora
 * 
 * ROTA: /configuracoes
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  Key,
  Smartphone,
  Moon,
  Sun,
} from "lucide-react"

/**
 * Dados mockados do perfil do usuario
 * 
 * TODO: Integrar com autenticacao e API
 */
const userProfile = {
  name: "Administrador",
  email: "admin@fitpro.com",
  phone: "(11) 99999-0000",
  role: "Administrador",
  avatar: null,
}

/**
 * Dados mockados da academia
 * 
 * TODO: Integrar com banco de dados
 */
const gymSettings = {
  name: "FitPro Academia",
  address: "Rua das Flores, 123 - Centro",
  phone: "(11) 3333-4444",
  email: "contato@fitpro.com",
  openTime: "06:00",
  closeTime: "22:00",
}

/**
 * Componente ConfiguracoesPage
 * 
 * Gerencia estados de:
 * - activeTab: Aba atualmente selecionada
 * - notifications: Configuracoes de notificacao
 * - theme: Tema atual (light/dark)
 * - formData: Dados dos formularios
 * 
 * @returns JSX da pagina de configuracoes
 */
export default function ConfiguracoesPage() {
  /** Aba atualmente ativa */
  const [activeTab, setActiveTab] = useState("profile")
  
  /** Configuracoes de notificacao */
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  })
  
  /** Tema atual */
  const [darkMode, setDarkMode] = useState(true)

  /**
   * Lista de abas de navegacao
   * Cada item contem:
   * - id: Identificador unico
   * - label: Texto exibido
   * - icon: Componente de icone
   */
  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "gym", label: "Academia", icon: Building },
    { id: "notifications", label: "Notificacoes", icon: Bell },
    { id: "security", label: "Seguranca", icon: Shield },
    { id: "appearance", label: "Aparencia", icon: Palette },
  ]

  /**
   * Renderiza conteudo baseado na aba ativa
   * @returns JSX do conteudo da aba
   */
  const renderContent = () => {
    switch (activeTab) {
      // ========================================
      // ABA: PERFIL DO USUARIO
      // ========================================
      case "profile":
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Perfil do Usuario</CardTitle>
              <CardDescription>
                Gerencie suas informacoes pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Secao de avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="border-border">
                    <Camera className="mr-2 h-4 w-4" />
                    Alterar Foto
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG ou GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Formulario de dados pessoais */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nome Completo
                  </label>
                  <Input
                    defaultValue={userProfile.name}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Cargo
                  </label>
                  <Input
                    defaultValue={userProfile.role}
                    className="bg-secondary border-border"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      defaultValue={userProfile.email}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      defaultValue={userProfile.phone}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Botao de salvar */}
              <div className="flex justify-end">
                <Button className="bg-primary text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alteracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      // ========================================
      // ABA: CONFIGURACOES DA ACADEMIA
      // ========================================
      case "gym":
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Configuracoes da Academia
              </CardTitle>
              <CardDescription>
                Informacoes gerais da sua academia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Nome da Academia
                  </label>
                  <Input
                    defaultValue={gymSettings.name}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Endereco
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      defaultValue={gymSettings.address}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      defaultValue={gymSettings.phone}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      defaultValue={gymSettings.email}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Horario de Abertura
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="time"
                      defaultValue={gymSettings.openTime}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Horario de Fechamento
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="time"
                      defaultValue={gymSettings.closeTime}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-primary text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alteracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      // ========================================
      // ABA: NOTIFICACOES
      // ========================================
      case "notifications":
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Notificacoes</CardTitle>
              <CardDescription>
                Configure como voce deseja receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de opcoes de notificacao */}
              {[
                {
                  id: "email",
                  title: "Notificacoes por Email",
                  description: "Receba atualizacoes importantes por email",
                  icon: Mail,
                },
                {
                  id: "push",
                  title: "Notificacoes Push",
                  description: "Alertas em tempo real no navegador",
                  icon: Bell,
                },
                {
                  id: "sms",
                  title: "Notificacoes por SMS",
                  description: "Mensagens de texto para lembretes urgentes",
                  icon: Smartphone,
                },
                {
                  id: "marketing",
                  title: "Comunicacoes de Marketing",
                  description: "Novidades, promocoes e dicas",
                  icon: Globe,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/20 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.id as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.id]: checked,
                        }))
                      }
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )

      // ========================================
      // ABA: SEGURANCA
      // ========================================
      case "security":
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Seguranca</CardTitle>
              <CardDescription>
                Proteja sua conta com opcoes de seguranca avancadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alteracao de senha */}
              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Alterar Senha</p>
                    <p className="text-sm text-muted-foreground">
                      Atualize sua senha regularmente para maior seguranca
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Senha Atual
                    </label>
                    <Input
                      type="password"
                      placeholder="********"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Nova Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="********"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <Button className="mt-4 bg-primary text-primary-foreground">
                  Atualizar Senha
                </Button>
              </div>

              {/* Autenticacao de dois fatores */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Autenticacao de Dois Fatores
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de seguranca
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-500">
                  Desativado
                </Badge>
              </div>

              {/* Sessoes ativas */}
              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sessoes Ativas</p>
                    <p className="text-sm text-muted-foreground">
                      Gerencie dispositivos conectados a sua conta
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded bg-background p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Chrome - Windows
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sessao atual - Sao Paulo, BR
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      // ========================================
      // ABA: APARENCIA
      // ========================================
      case "appearance":
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Aparencia</CardTitle>
              <CardDescription>
                Personalize a aparencia do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selecao de tema */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    {darkMode ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Modo Escuro</p>
                    <p className="text-sm text-muted-foreground">
                      {darkMode
                        ? "Tema escuro ativado"
                        : "Tema claro ativado"}
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              {/* Selecao de idioma */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Idioma</p>
                    <p className="text-sm text-muted-foreground">
                      Portugues (Brasil)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border">
                  Alterar
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <AppLayout>
      {/* CABECALHO DA PAGINA */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferencias e configuracoes do sistema
        </p>
      </div>

      {/* LAYOUT: SIDEBAR + CONTEUDO */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* MENU LATERAL DE NAVEGACAO */}
        <Card className="bg-card border-border lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* AREA DE CONTEUDO */}
        <div className="lg:col-span-3">{renderContent()}</div>
      </div>
    </AppLayout>
  )
}
