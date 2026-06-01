/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE HEADER
 * ============================================================================
 * 
 * Cabeçalho principal exibido no topo de cada página.
 * Contém título da página, barra de busca e notificações.
 * 
 * ESTRUTURA VISUAL:
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ [≡]  Dashboard                              [🔍 Buscar...]    [🔔]  │
 * │      Bem-vindo de volta!                                             │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * ELEMENTOS:
 * - Botão de menu (hamburger): Visível apenas no mobile, abre a sidebar
 * - Título: Nome da página atual (ex: "Dashboard", "Alunos")
 * - Subtítulo: Descrição opcional da página
 * - Campo de busca: Visível apenas em telas médias e maiores
 * - Botão de notificações: Com indicador de notificações não lidas
 * 
 * COMPORTAMENTO RESPONSIVO:
 * - Mobile: Botão menu visível, busca oculta
 * - Tablet/Desktop: Botão menu oculto, busca visível
 * 
 * POSICIONAMENTO:
 * - sticky top-0: Fica fixo no topo durante scroll
 * - z-30: Abaixo do overlay da sidebar (z-40) mas acima do conteúdo
 * - Efeito de blur no fundo para indicar conteúdo por baixo
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Props do componente Header
 * 
 * @property title - Título principal da página (obrigatório)
 * @property subtitle - Descrição ou mensagem secundária (opcional)
 * @property onMenuClick - Callback chamado ao clicar no botão de menu (mobile)
 */
interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

/**
 * Componente Header
 * 
 * Renderiza o cabeçalho responsivo com título, busca e notificações.
 * 
 * @param props - Props do componente
 * @returns JSX do header
 */
export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    /**
     * Container principal do header
     * 
     * Classes utilizadas:
     * - sticky top-0: Fixa no topo durante scroll
     * - z-30: Camada acima do conteúdo, abaixo da sidebar
     * - border-b: Borda inferior sutil
     * - bg-background/95: Fundo quase opaco
     * - backdrop-blur: Efeito de desfoque no fundo
     * - supports-[backdrop-filter]: Fallback para navegadores sem suporte
     */
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 
        Container interno com altura fixa e alinhamento
        - h-16: Altura de 64px
        - gap-4: Espaçamento entre elementos
        - px-6: Padding horizontal
      */}
      <div className="flex h-16 items-center gap-4 px-6">
        {/* 
          BOTÃO DE MENU (HAMBURGER)
          - Visível apenas em mobile (lg:hidden)
          - Ao clicar, chama onMenuClick para abrir a sidebar
        */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 
          ÁREA DE TÍTULO
          - flex-1: Ocupa todo o espaço disponível
          - Contém título principal e subtítulo opcional
        */}
        <div className="flex-1">
          {/* Título da página */}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {/* Subtítulo condicional - só renderiza se existir */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* 
          BARRA DE BUSCA
          - hidden md:flex: Oculta em mobile, visível em tablet+
          - Ícone de busca posicionado dentro do input
        */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            {/* 
              Ícone de busca posicionado absolutamente
              - left-3: 12px da borda esquerda
              - top-1/2 -translate-y-1/2: Centralizado verticalmente
            */}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {/* 
              Input de busca
              - w-64: Largura fixa de 256px
              - pl-9: Padding left para não sobrepor o ícone
            */}
            <Input
              placeholder="Buscar..."
              className="w-64 pl-9 bg-secondary border-border"
              aria-label="Buscar no sistema"
            />
          </div>
        </div>

        {/* 
          BOTÃO DE NOTIFICAÇÕES
          - Sempre visível em todas as resoluções
          - Indicador visual de notificações não lidas
        */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Ver notificações"
        >
          <Bell className="h-5 w-5" />
          {/* 
            Indicador de notificações não lidas
            - Ponto colorido no canto superior direito
            - bg-primary: Usa cor primária (dourado)
          */}
          <span 
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" 
            aria-label="Notificações não lidas"
          />
        </Button>
      </div>
    </header>
  )
}
