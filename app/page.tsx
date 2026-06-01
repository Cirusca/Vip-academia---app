/**
 * ============================================================================
 * FITPRO ACADEMIA - PÁGINA PRINCIPAL (DASHBOARD)
 * ============================================================================
 * 
 * Página inicial do sistema que apresenta uma visão geral da academia.
 * Exibe métricas principais, gráficos de atividade e treinos do dia.
 * 
 * ESTRUTURA DA PÁGINA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ [StatsCards] - Cards com métricas principais                           │
 * │ ┌─────────────────────────────────────────────────────────────────────┐│
 * │ │ Alunos Ativos │ Treinos Criados │ Aulas Hoje │ Taxa de Retenção    ││
 * │ │     324       │      156        │     28     │       89%           ││
 * │ └─────────────────────────────────────────────────────────────────────┘│
 * │                                                                         │
 * │ ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
 * │ │ [ActivityChart]                 │ │ [RecentActivity]                ││
 * │ │ Gráfico de atividade semanal    │ │ Lista de atividades recentes   ││
 * │ │                                 │ │ - João completou treino         ││
 * │ │                                 │ │ - Maria se cadastrou            ││
 * │ └─────────────────────────────────┘ └─────────────────────────────────┘│
 * │                                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐│
 * │ │ [WorkoutList] - Treinos do dia (versão compacta)                    ││
 * │ │ Treino A - Peito e Tríceps    [Iniciar]                            ││
 * │ │ Treino B - Costas e Bíceps    [Iniciar]                            ││
 * │ └─────────────────────────────────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * COMPONENTES UTILIZADOS:
 * - AppLayout: Layout base com sidebar e header
 * - StatsCards: Cards com indicadores principais
 * - ActivityChart: Gráfico de área com atividade semanal
 * - RecentActivity: Feed de atividades recentes dos alunos
 * - WorkoutList: Lista de treinos disponíveis
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

// Importação do layout base da aplicação
import { AppLayout } from "@/components/app-layout"

// Importação dos componentes do dashboard
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { WorkoutList } from "@/components/dashboard/workout-list"

/**
 * Componente da página Dashboard
 * 
 * Esta é a página raiz ("/") da aplicação.
 * Renderiza uma visão geral com métricas e atividades da academia.
 * 
 * LAYOUT RESPONSIVO:
 * - Mobile: Componentes empilhados verticalmente
 * - Desktop: Gráfico e atividades lado a lado (grid 2 colunas)
 * 
 * @returns JSX da página Dashboard
 */
export default function DashboardPage() {
  return (
    /**
     * AppLayout fornece a estrutura base:
     * - title: Exibido no header da página
     * - subtitle: Mensagem de boas-vindas
     */
    <AppLayout
      title="Dashboard"
      subtitle="Bem-vindo de volta! Aqui está o resumo da sua academia."
    >
      {/* 
        CARDS DE ESTATÍSTICAS
        Exibe métricas principais: alunos, treinos, aulas, retenção
        O componente gerencia seu próprio layout de grid
      */}
      <StatsCards />
      
      {/* 
        SEÇÃO DE GRÁFICOS E ATIVIDADES
        - grid: Layout de grid CSS
        - gap-4 md:gap-6: Espaçamento aumenta em telas maiores
        - lg:grid-cols-2: Duas colunas em telas grandes
        
        Comportamento responsivo:
        - Mobile/Tablet: Uma coluna, empilhados
        - Desktop (lg+): Duas colunas lado a lado
      */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* 
          Gráfico de atividade semanal
          Exibe quantidade de alunos e treinos por dia da semana
        */}
        <ActivityChart />
        
        {/* 
          Feed de atividades recentes
          Lista últimas ações dos alunos (treinos, cadastros, etc.)
        */}
        <RecentActivity />
      </div>
      
      {/* 
        LISTA DE TREINOS DO DIA
        - compact=true: Exibe versão resumida (apenas 3 treinos)
        - Inclui botão "Ver todos" para página completa de treinos
      */}
      <WorkoutList compact />
    </AppLayout>
  )
}
