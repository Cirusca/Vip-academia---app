"use client"

import { Dumbbell, Clock, Flame, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    title: "Treinos esta semana",
    value: "5",
    change: "+2 vs semana passada",
    icon: Dumbbell,
  },
  {
    title: "Duração média",
    value: "52min",
    change: "+8min vs semana passada",
    icon: Clock,
  },
  {
    title: "Calorias queimadas",
    value: "2.840",
    change: "kcal esta semana",
    icon: Flame,
  },
  {
    title: "Sequência atual",
    value: "12 dias",
    change: "Recorde pessoal: 18 dias",
    icon: TrendingUp,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {stat.title}
                </p>
                <p className="mt-1 text-xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-primary leading-tight">
                  {stat.change}
                </p>
              </div>
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
