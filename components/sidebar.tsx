/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE SIDEBAR
 * ============================================================================
 * 
 * Barra de navegação lateral com menu de acesso às páginas do sistema.
 * Implementa comportamento responsivo: fixa no desktop, drawer no mobile.
 * 
 * ESTRUTURA VISUAL:
 * ┌─────────────────────────────────┐
 * │ [Logo] FitPro Academia     [X] │  <- Botão X só aparece no mobile
 * │─────────────────────────────────│
 * │ ● Dashboard                    │  <- Item ativo tem fundo primário
 * │ ○ Treinos                      │
 * │ ○ Alunos                       │
 * │ ○ Personal Trainers            │
 * │ ○ Agenda                       │
 * │ ○ Relatórios                   │
 * │ ○ Configurações                │
 * │                                │
 * │─────────────────────────────────│
 * │ [AD] Admin - Gerente    [Sair] │  <- Área do usuário logado
 * └─────────────────────────────────┘
 * 
 * COMPORTAMENTO RESPONSIVO:
 * - Desktop (lg+): Sempre visível, posição fixa
 * - Mobile: Oculta por padrão, abre como drawer com overlay escuro
 * 
 * NAVEGAÇÃO:
 * - Usa Next.js Link para navegação client-side
 * - usePathname detecta rota atual para destacar item ativo
 * - Fecha automaticamente ao clicar em item no mobile
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,  // Ícone do Dashboard
  Dumbbell,         // Ícone de Treinos
  Users,            // Ícone de Alunos
  UserPlus,         // Ícone de Personal Trainers
  Calendar,         // Ícone de Agenda
  BarChart3,        // Ícone de Relatórios
  Settings,         // Ícone de Configurações
  LogOut,           // Ícone de Logout
  X,                // Ícone de fechar (mobile)
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Array de itens do menu de navegação
 * 
 * Cada item contém:
 * - href: Rota da página (usado pelo Link e para detectar item ativo)
 * - label: Texto exibido no menu
 * - icon: Componente de ícone do Lucide React
 * 
 * MANUTENÇÃO:
 * - Para adicionar nova página, adicione item neste array
 * - A ordem dos itens define a ordem no menu
 */
const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/personal", label: "Personal Trainers", icon: UserPlus },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

/**
 * Props do componente Sidebar
 * 
 * @property isOpen - Estado de visibilidade no mobile (true = visível)
 * @property onClose - Callback chamado ao fechar a sidebar
 */
interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Componente Sidebar
 * 
 * Renderiza a navegação lateral com comportamento responsivo.
 * 
 * @param props - Props do componente
 * @returns JSX da sidebar
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Hook do Next.js para obter a rota atual
  // Usado para destacar o item de menu ativo
  const pathname = usePathname()

  return (
    <>
      {/* 
        OVERLAY PARA MOBILE
        - Aparece apenas quando isOpen é true e em telas menores que lg
        - Clique no overlay fecha a sidebar
        - bg-black/50 cria fundo semi-transparente escuro
        - z-40 garante que fica abaixo da sidebar (z-50)
      */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 
        SIDEBAR PRINCIPAL
        - Posição fixa à esquerda, altura 100% da tela
        - Largura 256px (w-64)
        - Animação de slide com transition-transform
        - lg:translate-x-0 mantém visível em desktop
        - No mobile, translate-x controla visibilidade
      */}
      <aside
        className={cn(
          // Estilos base: posição fixa, dimensões, cor de fundo
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out",
          // Desktop: sempre visível
          "lg:translate-x-0",
          // Mobile: visível ou oculta baseado em isOpen
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        // Acessibilidade: identifica como navegação
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex h-full flex-col">
          {/* 
            ÁREA DO LOGO
            - Contém logo da marca e botão de fechar (mobile)
            - Altura fixa de 80px (h-20)
            - Borda inferior separa do menu
          */}
          <div className="flex h-20 items-center justify-between border-b border-border px-6">
            {/* Logo e nome da marca */}
            <div className="flex items-center gap-3">
              {/* Ícone em fundo primário (dourado) */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              </div>
              {/* Texto da marca */}
              <div>
                <h1 className="text-lg font-bold text-foreground">FitPro</h1>
                <p className="text-xs text-muted-foreground">Academia</p>
              </div>
            </div>
            
            {/* 
              Botão de fechar - apenas visível no mobile
              lg:hidden oculta em telas grandes
            */}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 
            NAVEGAÇÃO PRINCIPAL
            - flex-1 ocupa todo o espaço disponível
            - Cada item é um Link com estilos condicionais
          */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              // Verifica se este item corresponde à rota atual
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose} // Fecha sidebar ao navegar (mobile)
                  className={cn(
                    // Estilos base para todos os itens
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    // Estilos condicionais baseado em isActive
                    isActive
                      // Ativo: fundo primário (dourado), texto escuro
                      ? "bg-primary text-primary-foreground"
                      // Inativo: texto cinza, hover muda para fundo secundário
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  // Acessibilidade: indica página atual
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Ícone do item (componente dinâmico) */}
                  <item.icon className="h-5 w-5" />
                  {/* Texto do item */}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 
            ÁREA DO USUÁRIO
            - Fixa na parte inferior da sidebar
            - Exibe avatar, nome, cargo e botão de logout
            - Borda superior separa do menu
          */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
              {/* Avatar do usuário com iniciais */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                AD
              </div>
              {/* Informações do usuário */}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Gerente</p>
              </div>
              {/* Botão de logout */}
              <button 
                className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Sair do sistema"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
