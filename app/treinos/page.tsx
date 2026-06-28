/**
 * ============================================================================
 * FITPRO ACADEMIA - PÁGINA DE TREINOS
 * ============================================================================
 * 
 * Página para visualização e gerenciamento dos planos de treino.
 * Permite ver exercícios detalhados, acompanhar progresso e assistir vídeos.
 * 
 * FUNCIONALIDADES:
 * - Visualização de planos de treino (A, B, C)
 * - Expansão/colapso de exercícios por treino
 * - Marcação de exercícios como concluídos
 * - Modal com vídeo demonstrativo de cada exercício
 * - Histórico de treinos realizados
 * - Estatísticas de progresso
 * 
 * ABAS DISPONÍVEIS:
 * - Meus Treinos: Lista de planos de treino ativos
 * - Histórico: Registro de treinos já realizados
 * - Progresso: Métricas de evolução do aluno
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

import { AppLayout } from "@/components/app-layout"
import { WorkoutDetails } from "@/components/workouts/workout-details"
import { getWorkoutPlans } from "@/lib/data/workouts"

/**
 * Página de Treinos — SERVER COMPONENT.
 *
 * Busca os planos no servidor via a fachada `lib/data` (hoje mock, amanhã Prisma)
 * e passa por props ao `WorkoutDetails` (client), que cuida da interatividade.
 * Os dados nunca são embutidos no bundle do cliente.
 *
 * @returns JSX da página de Treinos
 */
export default async function TreinosPage() {
  const plans = await getWorkoutPlans()

  return (
    <AppLayout
      title="Treinos"
      subtitle="Gerencie seus planos de treino e acompanhe seu progresso."
    >
      {/* Detalhes dos treinos: abas, expansão de exercícios, vídeos e progresso */}
      <WorkoutDetails plans={plans} />
    </AppLayout>
  )
}
