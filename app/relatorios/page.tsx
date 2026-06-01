/**
 * ============================================================================
 * FITPRO ACADEMIA - PAGINA DE RELATORIOS
 * ============================================================================
 * 
 * Pagina de relatorios e analytics da academia.
 * Exibe graficos, metricas e indicadores de desempenho do negocio.
 * 
 * TIPOS DE RELATORIOS:
 * - Financeiro: receitas, despesas, lucro
 * - Alunos: matriculas, cancelamentos, retencao
 * - Frequencia: check-ins, horarios de pico
 * - Personal: desempenho dos trainers
 * 
 * VISUALIZACOES:
 * - Graficos de linha (evolucao temporal)
 * - Graficos de barra (comparativos)
 * - Cards de metricas principais
 * - Tabelas detalhadas
 * 
 * FILTROS:
 * - Periodo (diario, semanal, mensal, anual)
 * - Tipo de dado
 * - Exportacao de dados
 * 
 * ROTA: /relatorios
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

/**
 * Dados mockados para grafico de receita mensal
 * 
 * Estrutura:
 * - month: Mes abreviado
 * - receita: Valor da receita
 * - despesas: Valor das despesas
 * - lucro: Lucro liquido
 * 
 * TODO: Integrar com API de financeiro
 */
const revenueData = [
  { month: "Jan", receita: 45000, despesas: 28000, lucro: 17000 },
  { month: "Fev", receita: 52000, despesas: 30000, lucro: 22000 },
  { month: "Mar", receita: 48000, despesas: 29000, lucro: 19000 },
  { month: "Abr", receita: 61000, despesas: 32000, lucro: 29000 },
  { month: "Mai", receita: 55000, despesas: 31000, lucro: 24000 },
  { month: "Jun", receita: 67000, despesas: 35000, lucro: 32000 },
]

/**
 * Dados mockados para grafico de frequencia semanal
 * 
 * Estrutura:
 * - day: Dia da semana
 * - checkins: Numero de check-ins
 * 
 * TODO: Integrar com API de frequencia
 */
const frequencyData = [
  { day: "Seg", checkins: 145 },
  { day: "Ter", checkins: 132 },
  { day: "Qua", checkins: 158 },
  { day: "Qui", checkins: 141 },
  { day: "Sex", checkins: 167 },
  { day: "Sab", checkins: 98 },
  { day: "Dom", checkins: 45 },
]

/**
 * Metricas principais do dashboard
 * 
 * Estrutura:
 * - title: Nome da metrica
 * - value: Valor formatado
 * - change: Variacao percentual
 * - trend: up ou down
 * - icon: Componente de icone
 * - color: Cor do icone/destaque
 * 
 * TODO: Calcular dinamicamente com dados reais
 */
const metrics = [
  {
    title: "Receita Total",
    value: "R$ 67.000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-500",
  },
  {
    title: "Novos Alunos",
    value: "48",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Taxa de Retencao",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    title: "Cancelamentos",
    value: "12",
    change: "-15.3%",
    trend: "down",
    icon: TrendingDown,
    color: "text-red-500",
  },
]

/**
 * Top 5 planos mais vendidos
 * 
 * TODO: Integrar com API de vendas
 */
const topPlans = [
  { name: "Plano Anual Premium", sales: 156, revenue: "R$ 234.000" },
  { name: "Plano Semestral", sales: 98, revenue: "R$ 88.200" },
  { name: "Plano Mensal", sales: 234, revenue: "R$ 46.800" },
  { name: "Plano Trimestral", sales: 67, revenue: "R$ 40.200" },
  { name: "Day Pass", sales: 312, revenue: "R$ 15.600" },
]

/**
 * Componente RelatoriosPage
 * 
 * Pagina de relatorios e analytics com:
 * - Cards de metricas principais
 * - Graficos de receita e frequencia
 * - Ranking de planos mais vendidos
 * - Opcoes de filtro e exportacao
 * 
 * @returns JSX da pagina de relatorios
 */
export default function RelatoriosPage() {
  /** Periodo selecionado para os relatorios */
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month")

  return (
    <AppLayout>
      {/* CABECALHO DA PAGINA */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho da sua academia
          </p>
        </div>
        
        {/* Botoes de acao */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" className="border-border">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* SELETOR DE PERIODO */}
      <div className="mb-6 flex gap-2">
        {[
          { key: "day", label: "Hoje" },
          { key: "week", label: "Semana" },
          { key: "month", label: "Mes" },
          { key: "year", label: "Ano" },
        ].map((item) => (
          <Button
            key={item.key}
            variant={period === item.key ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(item.key as typeof period)}
            className={
              period === item.key
                ? "bg-primary text-primary-foreground"
                : "border-border"
            }
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* CARDS DE METRICAS PRINCIPAIS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"
          
          return (
            <Card key={metric.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${metric.color} bg-opacity-20`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  
                  {/* Indicador de tendencia */}
                  <Badge
                    className={`${
                      isPositive
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* GRAFICOS */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* GRAFICO DE RECEITA */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Receita vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    {/* Gradiente para area de receita */}
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    {/* Gradiente para area de despesas */}
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#D4AF37"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorDespesas)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRAFICO DE FREQUENCIA */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Frequencia Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="checkins"
                    fill="#D4AF37"
                    radius={[4, 4, 0, 0]}
                    name="Check-ins"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE TOP PLANOS */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Planos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Plano
                  </th>
                  <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                    Vendas
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPlans.map((plan, index) => (
                  <tr
                    key={plan.name}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* Posicao no ranking */}
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : index === 1
                              ? "bg-secondary text-foreground"
                              : "bg-secondary/50 text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">
                          {plan.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-foreground">
                      {plan.sales}
                    </td>
                    <td className="py-3 text-right font-medium text-primary">
                      {plan.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
