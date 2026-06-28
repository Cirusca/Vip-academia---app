import { Dumbbell, Clock, Flame, TrendingUp, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardStat, StatIconKey } from "@/lib/types"

// Mapa chave→ícone (o componente de ícone vive no cliente; os dados trazem só a chave).
const ICONS: Record<StatIconKey, LucideIcon> = {
  dumbbell: Dumbbell,
  clock: Clock,
  flame: Flame,
  "trending-up": TrendingUp,
}

export function StatsCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon]
        return (
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
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
