"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ActivityPoint } from "@/lib/types"

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Duração dos Treinos (min)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={28}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={1} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
            <YAxis stroke="#666" axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [`${value} min`, "Duração"]}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="duracao"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              name="Duração"
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex justify-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span>Minutos de treino por dia</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
