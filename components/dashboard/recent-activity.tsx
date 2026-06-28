"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Flame, Dumbbell, ChevronRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { RecentWorkout } from "@/lib/types"

// Último treino realizado — recebido por prop (vem da fachada via Server Component).
export function RecentActivity({ workout: lastWorkout }: { workout: RecentWorkout }) {
  const doneCount = lastWorkout.exercises.filter((e) => e.done).length
  const total = lastWorkout.exercises.length
  const percent = Math.round((doneCount / total) * 100)

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-foreground">Último Treino</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{lastWorkout.date}</p>
        </div>
        {lastWorkout.completed ? (
          <Badge className="bg-green-500/15 text-green-400 border-green-500/30 border text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Em andamento</Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Nome do treino */}
        <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-foreground text-sm truncate">
            {lastWorkout.name}
          </span>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{lastWorkout.duration}</p>
            <p className="text-xs text-muted-foreground">Duração</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{lastWorkout.calories}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{doneCount}/{total}</p>
            <p className="text-xs text-muted-foreground">Exercícios</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progresso do treino</span>
            <span className="text-primary font-medium">{percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Lista de exercícios */}
        <div className="space-y-1.5">
          {lastWorkout.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm rounded-md px-2 py-1.5 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2
                  className={`h-3.5 w-3.5 shrink-0 ${ex.done ? "text-green-400" : "text-muted-foreground/30"}`}
                />
                <span className={`truncate ${ex.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {ex.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {ex.sets}x{ex.reps}
              </span>
            </div>
          ))}
        </div>

        <Link href="/treinos">
          <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary">
            Ver todos os treinos <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
