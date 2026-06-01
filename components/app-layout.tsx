/**
 * ============================================================================
 * FITPRO ACADEMIA - LAYOUT DA APLICAÇÃO
 * ============================================================================
 * 
 * Componente de layout que envolve todas as páginas internas da aplicação.
 * Gerencia a estrutura visual com sidebar, header e área de conteúdo.
 * 
 * RESPONSABILIDADES:
 * - Renderizar a sidebar de navegação
 * - Renderizar o header com título e busca
 * - Gerenciar estado de abertura/fechamento da sidebar no mobile
 * - Prover área de conteúdo responsiva
 * 
 * ESTRUTURA VISUAL:
 * ┌─────────────────────────────────────────────────────┐
 * │ [Sidebar]  │  [Header - Título e Busca]             │
 * │            │────────────────────────────────────────│
 * │ - Dashboard│  [Área de Conteúdo]                    │
 * │ - Treinos  │                                        │
 * │ - Alunos   │  {children} são renderizados aqui      │
 * │ - Personal │                                        │
 * │ - Agenda   │                                        │
 * │ - Relatório│                                        │
 * │ - Config   │                                        │
 * └─────────────────────────────────────────────────────┘
 * 
 * COMPORTAMENTO RESPONSIVO:
 * - Desktop (lg+): Sidebar fixa à esquerda (256px)
 * - Mobile: Sidebar oculta, abre como drawer com overlay
 * 
 * @example
 * // Uso em uma página
 * <AppLayout title="Dashboard" subtitle="Bem-vindo!">
 *   <MeuConteudo />
 * </AppLayout>
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

/**
 * Props do componente AppLayout
 * 
 * @property children - Conteúdo da página a ser renderizado na área principal
 * @property title - Título exibido no header da página
 * @property subtitle - Subtítulo opcional com descrição da página
 */
interface AppLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

/**
 * Componente de layout principal da aplicação
 * 
 * Este componente é Client Component ("use client") porque:
 * - Gerencia estado local (sidebarOpen)
 * - Precisa de interatividade (abrir/fechar sidebar)
 * 
 * @param props - Props do componente
 * @returns JSX do layout completo
 */
export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  /**
   * Estado que controla a visibilidade da sidebar no mobile
   * - true: sidebar visível (drawer aberto)
   * - false: sidebar oculta
   * 
   * No desktop (lg+), a sidebar é sempre visível via CSS,
   * então este estado só afeta a versão mobile.
   */
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    // Container principal com altura mínima da tela e cor de fundo
    <div className="min-h-screen bg-background">
      {/* 
        Sidebar de navegação
        - Recebe estado de abertura e função de fechamento
        - Gerencia overlay e animação internamente
      */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* 
        Área de conteúdo principal
        - lg:ml-64 cria margem esquerda igual à largura da sidebar (256px)
        - Em telas menores, a sidebar é overlay, então não precisa de margem
      */}
      <div className="lg:ml-64">
        {/* 
          Header com título, subtítulo e busca
          - onMenuClick abre a sidebar no mobile
        */}
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* 
          Área de conteúdo com padding responsivo
          - p-4 md:p-6: padding aumenta em telas maiores
          - space-y-4 md:space-y-6: espaçamento vertical entre elementos filhos
        */}
        <main className="p-4 md:p-6 space-y-4 md:space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
