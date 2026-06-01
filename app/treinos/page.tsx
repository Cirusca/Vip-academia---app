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

"use client"

import { AppLayout } from "@/components/app-layout"
import { WorkoutDetails } from "@/components/workouts/workout-details"

/**
 * Componente da página de Treinos
 * 
 * Renderiza o layout com o componente WorkoutDetails que contém
 * toda a lógica de visualização e interação com treinos.
 * 
 * @returns JSX da página de Treinos
 */
export default function TreinosPage() {
  return (
    <AppLayout
      title="Treinos"
      subtitle="Gerencie seus planos de treino e acompanhe seu progresso."
    >
      {/* 
        Componente principal de detalhes dos treinos
        Gerencia abas, expansão de exercícios, vídeos e progresso
      */}
      <WorkoutDetails />
    </AppLayout>
  )
}
