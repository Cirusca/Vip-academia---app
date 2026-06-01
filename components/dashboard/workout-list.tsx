/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE WORKOUT LIST
 * ============================================================================
 * 
 * Lista de treinos disponíveis para o dia.
 * Cada treino exibe informações como duração, calorias e nível de dificuldade.
 * 
 * MODOS DE EXIBIÇÃO:
 * - compact=true: Exibe apenas 3 treinos (usado no dashboard)
 * - compact=false: Exibe todos os treinos (usado na página de treinos)
 * 
 * ESTRUTURA VISUAL DE CADA TREINO:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ [▶] Treino A - Peito e Tríceps                                        │
 * │     ⏱ 45 min  🔥 320 kcal  8 exercícios    [Intermediário]  [Iniciar] │
 * └────────────────────────────────────────────────────────────────────────┘
 * 
 * INFORMAÇÕES EXIBIDAS:
 * - Ícone colorido de play (cor indica categoria do treino)
 * - Nome do treino
 * - Duração estimada
 * - Calorias estimadas
 * - Quantidade de exercícios
 * - Nível de dificuldade (badge)
 * - Botão para iniciar
 * 
 * NÍVEIS DE DIFICULDADE:
 * - Iniciante: Treinos mais leves, indicados para novos alunos
 * - Intermediário: Treinos balanceados para alunos regulares
 * - Avançado: Treinos intensos para alunos experientes
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Flame, ChevronRight } from "lucide-react"

/**
 * Array de treinos disponíveis
 * 
 * Estrutura:
 * - id: Identificador único do treino
 * - name: Nome descritivo do treino
 * - exercises: Quantidade de exercícios incluídos
 * - duration: Duração estimada em minutos
 * - calories: Estimativa de calorias queimadas
 * - level: Nível de dificuldade (Iniciante/Intermediário/Avançado)
 * - color: Classe Tailwind para cor do ícone
 * 
 * TODO: Substituir por dados da API/banco de dados
 */
const workouts = [
  {
    id: 1,
    name: "Treino A - Peito e Tríceps",
    exercises: 8,
    duration: "45 min",
    calories: 320,
    level: "Intermediário",
    color: "bg-primary", // Dourado - treino principal
  },
  {
    id: 2,
    name: "Treino B - Costas e Bíceps",
    exercises: 7,
    duration: "50 min",
    calories: 280,
    level: "Intermediário",
    color: "bg-blue-500", // Azul - treino de costas
  },
  {
    id: 3,
    name: "Treino C - Pernas Completo",
    exercises: 10,
    duration: "60 min",
    calories: 450,
    level: "Avançado",
    color: "bg-red-500", // Vermelho - treino intenso
  },
  {
    id: 4,
    name: "Treino D - Ombros e Abdômen",
    exercises: 9,
    duration: "40 min",
    calories: 250,
    level: "Iniciante",
    color: "bg-green-500", // Verde - treino leve
  },
]

/**
 * Props do componente WorkoutList
 * 
 * @property compact - Se true, exibe versão resumida (3 itens)
 */
interface WorkoutListProps {
  compact?: boolean
}

/**
 * Componente WorkoutList
 * 
 * Renderiza uma lista de treinos com informações detalhadas.
 * No modo compacto, exibe apenas 3 treinos e link "Ver todos".
 * 
 * @param props - Props do componente
 * @returns JSX com card contendo lista de treinos
 */
export function WorkoutList({ compact = false }: WorkoutListProps) {
  // No modo compacto, exibe apenas os 3 primeiros treinos
  const displayWorkouts = compact ? workouts.slice(0, 3) : workouts

  return (
    <Card className="bg-card border-border">
      {/* 
        Cabeçalho com título e link condicional
        flex-row alinha título e botão horizontalmente
      */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Treinos do Dia</CardTitle>
        
        {/* 
          Botão "Ver todos" - apenas no modo compacto
          Leva para a página completa de treinos
        */}
        {compact && (
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todos <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Container com espaçamento vertical entre treinos */}
        <div className="space-y-3">
          {/* Itera sobre os treinos a exibir */}
          {displayWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
            >
              {/* 
                ÍCONE DO TREINO
                Quadrado colorido com ícone de play
                A cor indica a categoria/intensidade do treino
              */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${workout.color}`}
              >
                <Play className="h-5 w-5 text-white" />
              </div>
              
              {/* 
                INFORMAÇÕES DO TREINO
                Contém nome e métricas
              */}
              <div className="flex-1 min-w-0">
                {/* Nome do treino com truncate para textos longos */}
                <h4 className="font-medium text-foreground truncate">
                  {workout.name}
                </h4>
                
                {/* 
                  Métricas do treino (duração, calorias, exercícios)
                  flex-wrap permite quebrar linha em telas pequenas
                */}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {/* Duração */}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {workout.duration}
                  </span>
                  
                  {/* Calorias estimadas */}
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    {workout.calories} kcal
                  </span>
                  
                  {/* Quantidade de exercícios */}
                  <span>{workout.exercises} exercícios</span>
                </div>
              </div>
              
              {/* 
                BADGE DE NÍVEL
                Oculto em mobile (hidden sm:inline-flex)
                Indica dificuldade do treino
              */}
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex bg-secondary text-muted-foreground"
              >
                {workout.level}
              </Badge>
              
              {/* 
                BOTÃO INICIAR
                Ação principal do card
              */}
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Iniciar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
