"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Clock, Flame, ChevronRight, Play } from "lucide-react"
import Link from "next/link"

const workouts = [
  {
    id: 1,
    name: "Treino A — Peito e Tríceps",
    exercises: 8,
    duration: "45 min",
    calories: 320,
    level: "Intermediário",
    color: "bg-primary",
    lastDone: "há 3 dias",
  },
  {
    id: 2,
    name: "Treino B — Costas e Bíceps",
    exercises: 7,
    duration: "50 min",
    calories: 280,
    level: "Intermediário",
    color: "bg-blue-500",
    lastDone: "Hoje",
  },
  {
    id: 3,
    name: "Treino C — Pernas Completo",
    exercises: 10,
    duration: "60 min",
    calories: 450,
    level: "Avançado",
    color: "bg-red-500",
    lastDone: "há 5 dias",
  },
]

interface WorkoutListProps {
  compact?: boolean
}

export function WorkoutList({ compact = false }: WorkoutListProps) {
  const displayWorkouts = compact ? workouts.slice(0, 3) : workouts

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Meus Treinos</CardTitle>
        <div className="flex items-center gap-2">
          <Link href="/treinos">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="h-4 w-4" />
              Novo Treino
            </Button>
          </Link>
          {compact && (
            <Link href="/treinos">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {displayWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${workout.color}`}>
                <Play className="h-5 w-5 text-white" fill="white" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate text-sm">
                  {workout.name}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {workout.calories} kcal
                  </span>
                  <span>{workout.exercises} exercícios</span>
                  <span className="text-muted-foreground/60">
                    Último: {workout.lastDone}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge
                  variant="secondary"
                  className="hidden sm:inline-flex bg-secondary text-muted-foreground text-xs"
                >
                  {workout.level}
                </Badge>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-7 px-3"
                >
                  Iniciar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
