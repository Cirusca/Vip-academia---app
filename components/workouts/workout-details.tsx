/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE WORKOUT DETAILS
 * ============================================================================
 * 
 * Componente principal para visualização detalhada dos planos de treino.
 * Permite expandir exercícios, marcar como concluído e assistir vídeos.
 * 
 * FUNCIONALIDADES:
 * - Abas para navegar entre "Meus Treinos", "Histórico" e "Progresso"
 * - Cards expansíveis para cada plano de treino
 * - Checkbox para marcar exercícios como concluídos
 * - Barra de progresso por treino
 * - Modal com vídeo demonstrativo e instruções
 * 
 * ESTRUTURA DO TREINO:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 🏋️ Treino A - Peito e Tríceps                              40% ▼      │
 * │    Segunda / Quinta    ⏱ 45-50 min   🔥 320-400 kcal   5 exercícios   │
 * │─────────────────────────────────────────────────────────────────────────│
 * │ ✓ Supino Reto       Peito         4x10-12   60s   [▶ Vídeo]          │
 * │ ✓ Supino Inclinado  Peito Sup.    3x10-12   60s   [▶ Vídeo]          │
 * │ ○ Crucifixo         Peito         3x12-15   45s   [▶ Vídeo]          │
 * │ ○ Tríceps Pulley    Tríceps       4x12-15   45s   [▶ Vídeo]          │
 * │ ○ Tríceps Francês   Tríceps       3x10-12   45s   [▶ Vídeo]          │
 * │                                                    [Iniciar Treino]   │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * DADOS DOS EXERCÍCIOS:
 * - name: Nome do exercício
 * - sets: Número de séries
 * - reps: Faixa de repetições
 * - rest: Tempo de descanso entre séries
 * - muscle: Grupo muscular trabalhado
 * - completed: Se já foi realizado
 * - videoUrl: URL do vídeo demonstrativo
 * - instructions: Texto com instruções de execução
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Play,
  Clock,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Dumbbell,
  RotateCcw,
  Video,
  Info,
} from "lucide-react"
import type { Exercise, WorkoutPlan } from "@/lib/types"

/**
 * Os planos de treino chegam por PROP (`plans`), vindos da fachada `lib/data`
 * via Server Component (ver `app/treinos/page.tsx`). Nenhum dado é embutido aqui.
 */

/**
 * Componente WorkoutDetails
 * 
 * Gerencia estados de:
 * - Qual treino está expandido
 * - Status de conclusão dos exercícios
 * - Exercício selecionado para o modal de vídeo
 * 
 * @returns JSX com abas de treinos, histórico e progresso
 */
interface WorkoutDetailsProps {
  plans: WorkoutPlan[]
}

export function WorkoutDetails({ plans }: WorkoutDetailsProps) {
  /**
   * Estado do treino atualmente expandido
   * null = nenhum expandido, string = id do treino expandido
   */
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>("treino-a")
  
  /**
   * Estado de conclusão dos exercícios
   * Chave: "workoutId-exerciseId", Valor: boolean
   * Permite persistir marcações durante a sessão
   */
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, boolean>>({})
  
  /**
   * Exercício selecionado para exibir no modal
   */
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  
  /**
   * Controla visibilidade do modal de vídeo
   */
  const [showVideo, setShowVideo] = useState(false)

  /**
   * Alterna o status de conclusão de um exercício
   * 
   * @param workoutId - ID do treino
   * @param exerciseId - ID do exercício
   */
  const toggleExercise = (workoutId: string, exerciseId: number) => {
    const key = `${workoutId}-${exerciseId}`
    setExerciseStatus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /**
   * Calcula o percentual de progresso de um treino
   * 
   * @param workout - Objeto do treino
   * @returns Percentual de exercícios concluídos (0-100)
   */
  const getProgress = (workout: WorkoutPlan) => {
    let completed = 0
    workout.exercises.forEach((ex) => {
      const key = `${workout.id}-${ex.id}`
      // Considera tanto o estado local quanto o status inicial
      if (exerciseStatus[key] || ex.completed) completed++
    })
    return Math.round((completed / workout.exercises.length) * 100)
  }

  /**
   * Abre o modal de vídeo para um exercício
   * 
   * @param exercise - Exercício a ser exibido
   */
  const openVideoModal = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setShowVideo(true)
  }

  return (
    <>
      {/* 
        SISTEMA DE ABAS
        Permite alternar entre visualizações diferentes
      */}
      <Tabs defaultValue="meus-treinos" className="space-y-4 md:space-y-6">
        {/* Navegação das abas */}
        <TabsList className="bg-secondary border border-border w-full justify-start overflow-x-auto">
          <TabsTrigger value="meus-treinos" className="text-xs md:text-sm">
            Meus Treinos
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-xs md:text-sm">
            Historico
          </TabsTrigger>
          <TabsTrigger value="progresso" className="text-xs md:text-sm">
            Progresso
          </TabsTrigger>
        </TabsList>

        {/* 
          ABA: MEUS TREINOS
          Lista de planos de treino com exercícios expandíveis
        */}
        <TabsContent value="meus-treinos" className="space-y-3 md:space-y-4">
          {plans.map((workout) => (
            <Card key={workout.id} className="bg-card border-border overflow-hidden">
              {/* 
                CABEÇALHO DO TREINO (clicável para expandir)
              */}
              <div
                className="cursor-pointer"
                onClick={() =>
                  setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)
                }
              >
                <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* Nome e dia do treino */}
                    <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-sm md:text-lg text-foreground flex items-center gap-1.5 md:gap-2">
                        <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                        <span className="truncate">{workout.name}</span>
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground">{workout.day}</p>
                    </div>
                    
                    {/* Progresso e botão de expandir */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs md:text-sm font-medium text-primary">
                          {getProgress(workout)}%
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">completo</p>
                      </div>
                      {expandedWorkout === workout.id ? (
                        <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Badges com informações do treino */}
                  <div className="flex flex-wrap gap-1.5 md:gap-3 pt-2">
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs px-1.5 md:px-2">
                      <Clock className="mr-1 h-3 w-3" />
                      {workout.duration}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs px-1.5 md:px-2">
                      <Flame className="mr-1 h-3 w-3" />
                      {workout.calories}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs px-1.5 md:px-2">
                      <Target className="mr-1 h-3 w-3" />
                      {workout.exercises.length} ex.
                    </Badge>
                  </div>
                </CardHeader>
              </div>

              {/* 
                LISTA DE EXERCÍCIOS (visível quando expandido)
              */}
              {expandedWorkout === workout.id && (
                <CardContent className="border-t border-border p-3 md:p-6 pt-3 md:pt-4">
                  <div className="space-y-2 md:space-y-3">
                    {workout.exercises.map((exercise) => {
                      const key = `${workout.id}-${exercise.id}`
                      const isCompleted = exerciseStatus[key] ?? exercise.completed

                      return (
                        <div
                          key={exercise.id}
                          className={`rounded-lg p-2.5 md:p-3 transition-colors ${
                            isCompleted
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-secondary/50"
                          }`}
                        >
                          <div className="flex items-start gap-2 md:gap-3">
                            {/* Botão de marcar como concluído */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExercise(workout.id, exercise.id)
                              }}
                              className="shrink-0 mt-0.5"
                              aria-label={isCompleted ? "Desmarcar exercício" : "Marcar como concluído"}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                            
                            {/* Informações do exercício */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4
                                    className={`font-medium text-sm md:text-base ${
                                      isCompleted
                                        ? "text-green-500 line-through"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {exercise.name}
                                  </h4>
                                  <p className="text-xs md:text-sm text-muted-foreground">
                                    {exercise.muscle}
                                  </p>
                                </div>
                                
                                {/* Botão de vídeo */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openVideoModal(exercise)
                                  }}
                                  className="shrink-0 h-7 md:h-8 px-2 md:px-3 border-primary/50 text-primary hover:bg-primary/10"
                                >
                                  <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                  <span className="ml-1 hidden sm:inline text-xs md:text-sm">Video</span>
                                </Button>
                              </div>
                              
                              {/* Séries, repetições e descanso */}
                              <div className="flex items-center gap-3 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <RotateCcw className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  {exercise.sets}x{exercise.reps}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  {exercise.rest}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Botão para iniciar o treino */}
                  <div className="mt-3 md:mt-4">
                    <Button className="w-full bg-primary text-primary-foreground h-9 md:h-10 text-sm">
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Treino
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* 
          ABA: HISTÓRICO
          Registro de treinos já realizados
        */}
        <TabsContent value="historico">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg text-foreground">Historico de Treinos</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-2 md:space-y-3">
                {/* Dados mockados do histórico */}
                {[
                  { date: "28/05/2026", workout: "Treino A", duration: "48 min", calories: 350 },
                  { date: "27/05/2026", workout: "Treino C", duration: "55 min", calories: 420 },
                  { date: "26/05/2026", workout: "Treino B", duration: "52 min", calories: 310 },
                  { date: "25/05/2026", workout: "Treino A", duration: "45 min", calories: 330 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-2.5 md:p-3"
                  >
                    <div>
                      <p className="font-medium text-sm md:text-base text-foreground">{item.workout}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm text-foreground">{item.duration}</p>
                      <p className="text-xs md:text-sm text-primary">{item.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 
          ABA: PROGRESSO
          Métricas gerais de evolução
        */}
        <TabsContent value="progresso">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg text-foreground">Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              {/* Grid de métricas */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="rounded-lg bg-secondary/50 p-2.5 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-bold text-primary">24</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Treinos</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2.5 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-bold text-green-500">8.5k</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Calorias</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2.5 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-bold text-blue-500">18h</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Tempo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 
        MODAL DE VÍDEO
        Exibe vídeo demonstrativo e instruções do exercício
      */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="bg-card border-border max-w-[95vw] md:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-3 md:p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base md:text-lg text-foreground pr-8">
                {selectedExercise?.name}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 p-3 md:p-4">
            {/* Área do vídeo (placeholder) */}
            <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <Play className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <p className="text-sm md:text-base text-foreground font-medium">{selectedExercise?.name}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Video demonstrativo</p>
              </div>
            </div>

            {/* Informações do exercício */}
            <div className="space-y-3">
              {/* Badges com séries, descanso e músculo */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {selectedExercise?.sets}x{selectedExercise?.reps}
                </Badge>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Descanso: {selectedExercise?.rest}
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {selectedExercise?.muscle}
                </Badge>
              </div>

              {/* Instruções de execução */}
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm font-medium text-foreground mb-1">Instrucoes</p>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {selectedExercise?.instructions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de fechar */}
            <Button 
              className="w-full bg-primary text-primary-foreground" 
              onClick={() => setShowVideo(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
