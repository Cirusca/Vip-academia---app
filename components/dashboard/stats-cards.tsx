/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE STATS CARDS
 * ============================================================================
 * 
 * Exibe cards com as métricas principais do dashboard.
 * Cada card mostra um indicador importante para a gestão da academia.
 * 
 * MÉTRICAS EXIBIDAS:
 * - Alunos Ativos: Quantidade total de alunos com matrícula ativa
 * - Treinos Criados: Total de planos de treino cadastrados
 * - Aulas Hoje: Número de aulas agendadas para o dia atual
 * - Taxa de Retenção: Percentual de alunos que renovam matrícula
 * 
 * ESTRUTURA VISUAL:
 * ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
 * │ Alunos Ativos  │ │Treinos Criados │ │  Aulas Hoje    │ │ Taxa Retenção  │
 * │     324        │ │     156        │ │      28        │ │     89%        │
 * │  +12% este mês │ │ +8% este mês   │ │ +5% este mês   │ │ +3% este mês   │
 * │           [👤] │ │           [🏋️] │ │           [📅] │ │           [📈] │
 * └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
 * 
 * LAYOUT RESPONSIVO:
 * - Mobile: 2 colunas (2x2)
 * - Desktop: 4 colunas (1x4)
 * 
 * DADOS:
 * Atualmente usa dados mockados. Para integrar com backend:
 * 1. Importe useSWR ou use Server Components
 * 2. Substitua o array 'stats' por dados da API
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { Users, Dumbbell, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Array de estatísticas do dashboard
 * 
 * Cada objeto contém:
 * - title: Rótulo do indicador
 * - value: Valor atual (string para flexibilidade de formato)
 * - change: Variação percentual no período
 * - trend: Direção da tendência (up/down) - preparado para uso futuro
 * - icon: Componente de ícone do Lucide
 * 
 * TODO: Substituir por dados dinâmicos da API
 */
const stats = [
  {
    title: "Alunos Ativos",
    value: "324",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Treinos Criados",
    value: "156",
    change: "+8%",
    trend: "up",
    icon: Dumbbell,
  },
  {
    title: "Aulas Hoje",
    value: "28",
    change: "+5%",
    trend: "up",
    icon: Calendar,
  },
  {
    title: "Taxa de Retenção",
    value: "89%",
    change: "+3%",
    trend: "up",
    icon: TrendingUp,
  },
]

/**
 * Componente StatsCards
 * 
 * Renderiza uma grade de cards com métricas principais.
 * Cada card exibe título, valor, variação e ícone.
 * 
 * @returns JSX com grid de cards de estatísticas
 */
export function StatsCards() {
  return (
    /**
     * Container grid responsivo
     * - gap-3: Espaçamento entre cards
     * - grid-cols-2: 2 colunas em mobile
     * - lg:grid-cols-4: 4 colunas em desktop
     */
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {/* Itera sobre cada estatística para criar um card */}
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          {/* 
            Conteúdo do card com padding responsivo
            - p-4: 16px em mobile
            - md:p-6: 24px em telas maiores
          */}
          <CardContent className="p-4 md:p-6">
            {/* 
              Layout flex para alinhar conteúdo e ícone
              - justify-between: Conteúdo à esquerda, ícone à direita
              - gap-2: Espaçamento mínimo entre elementos
            */}
            <div className="flex items-center justify-between gap-2">
              {/* Área de texto (título, valor, variação) */}
              <div className="min-w-0">
                {/* 
                  Título do indicador
                  - truncate: Corta texto longo com reticências
                  - Tamanho responsivo: xs em mobile, sm em tablet+
                */}
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {stat.title}
                </p>
                
                {/* 
                  Valor principal em destaque
                  - Tamanho responsivo: xl em mobile, 3xl em tablet+
                  - font-bold: Peso forte para destaque
                */}
                <p className="mt-1 text-xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                
                {/* 
                  Variação percentual
                  - text-primary: Cor dourada (positivo)
                  - "este mês" oculto em mobile para economia de espaço
                */}
                <p className="mt-1 text-xs md:text-sm text-primary">
                  {stat.change} <span className="hidden sm:inline">este mês</span>
                </p>
              </div>
              
              {/* 
                Container do ícone
                - Quadrado com fundo primário transparente
                - shrink-0: Não encolhe quando o espaço é limitado
                - Tamanho responsivo: 40px em mobile, 48px em tablet+
              */}
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {/* 
                  Ícone dinâmico usando sintaxe de componente
                  - stat.icon é um componente React (ex: Users, Dumbbell)
                  - Tamanho responsivo do ícone
                  - Cor primária (dourado)
                */}
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
