/**
 * ============================================================================
 * FITPRO ACADEMIA - PÁGINA DE PERSONAL TRAINERS
 * ============================================================================
 * 
 * Página para gerenciamento da equipe de Personal Trainers da academia.
 * Permite visualizar, buscar e cadastrar profissionais.
 * 
 * FUNCIONALIDADES:
 * - Listagem de personal trainers com informações completas
 * - Busca por nome ou especialidade
 * - Formulário de cadastro de novo personal
 * - Visualização de métricas (avaliação, alunos, certificações)
 * 
 * ESTRUTURA DA PÁGINA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ [🔍 Buscar...]                      [Filtros] [+ Novo Personal]        │
 * │─────────────────────────────────────────────────────────────────────────│
 * │ ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
 * │ │ [CM] Carlos Mendes    Disponível│ │ [FL] Fernanda Lima   Disponível ││
 * │ │ 8 anos experiência               │ │ 6 anos experiência              ││
 * │ │ [Musculação] [Funcional]        │ │ [Pilates] [Yoga]                ││
 * │ │ ⭐ 4.9 | 👥 45 | 🏅 3           │ │ ⭐ 4.8 | 👥 38 | 🏅 3           ││
 * │ │ [Agendar]    [Ver Perfil]       │ │ [Agendar]    [Ver Perfil]       ││
 * │ └─────────────────────────────────┘ └─────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { AppLayout } from "@/components/app-layout"
import { PersonalTrainerList } from "@/components/personal/trainer-list"

/**
 * Componente da página de Personal Trainers
 * 
 * Renderiza o layout com o componente PersonalTrainerList que contém
 * toda a lógica de listagem, busca e cadastro de profissionais.
 * 
 * @returns JSX da página de Personal Trainers
 */
export default function PersonalPage() {
  return (
    <AppLayout
      title="Personal Trainers"
      subtitle="Gerencie a equipe de profissionais da academia."
    >
      {/* 
        Componente de lista de personal trainers
        Gerencia busca, filtros e formulário de cadastro
      */}
      <PersonalTrainerList />
    </AppLayout>
  )
}
