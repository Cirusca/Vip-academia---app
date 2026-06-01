/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE ACTIVITY CHART
 * ============================================================================
 * 
 * Gráfico de área que exibe a atividade semanal da academia.
 * Mostra a comparação entre quantidade de alunos presentes e treinos realizados.
 * 
 * VISUALIZAÇÃO:
 * - Eixo X: Dias da semana (Seg a Dom)
 * - Eixo Y: Quantidade
 * - Área dourada: Número de alunos presentes
 * - Área verde: Número de treinos realizados
 * 
 * BIBLIOTECA UTILIZADA:
 * - Recharts (recharts.org) - Biblioteca de gráficos para React
 * - Componentes: AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
 * - ResponsiveContainer: Adapta o gráfico ao tamanho do container
 * 
 * CUSTOMIZAÇÕES:
 * - Cores: Dourado (#D4AF37) para alunos, Verde (#22C55E) para treinos
 * - Gradiente: Áreas preenchidas com gradiente transparente
 * - Tooltip: Estilizado com tema escuro da aplicação
 * - Grid: Linhas tracejadas sutis
 * 
 * DADOS:
 * Atualmente usa dados mockados. Para integrar com backend:
 * 1. Crie endpoint API que retorne dados agregados por dia
 * 2. Use useSWR para fetch client-side ou RSC para server-side
 * 3. Substitua o array 'data' pelos dados da API
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/**
 * Dados de atividade semanal
 * 
 * Estrutura:
 * - name: Abreviação do dia da semana
 * - alunos: Quantidade de alunos que frequentaram a academia
 * - treinos: Quantidade de treinos realizados
 * 
 * Nota: Um aluno pode realizar múltiplos treinos por visita,
 * por isso os valores podem diferir.
 * 
 * TODO: Substituir por dados dinâmicos da API
 */
const data = [
  { name: "Seg", alunos: 45, treinos: 32 },
  { name: "Ter", alunos: 52, treinos: 41 },
  { name: "Qua", alunos: 48, treinos: 38 },
  { name: "Qui", alunos: 61, treinos: 52 },
  { name: "Sex", alunos: 55, treinos: 45 },
  { name: "Sáb", alunos: 67, treinos: 58 },
  { name: "Dom", alunos: 34, treinos: 22 },
]

/**
 * Componente ActivityChart
 * 
 * Renderiza um gráfico de área com a atividade semanal.
 * O gráfico é responsivo e se adapta ao tamanho do container.
 * 
 * @returns JSX com card contendo o gráfico de atividade
 */
export function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      {/* Cabeçalho do card com título */}
      <CardHeader>
        <CardTitle className="text-foreground">Atividade Semanal</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* 
          ResponsiveContainer faz o gráfico se adaptar ao container pai
          - width="100%": Ocupa toda a largura disponível
          - height={300}: Altura fixa de 300px
        */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            {/* 
              DEFINIÇÕES DE GRADIENTES
              Usados para preencher as áreas com efeito de fade
            */}
            <defs>
              {/* Gradiente dourado para linha de alunos */}
              <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
              {/* Gradiente verde para linha de treinos */}
              <linearGradient id="colorTreinos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* 
              GRID DE FUNDO
              Linhas tracejadas para facilitar leitura dos valores
            */}
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            
            {/* 
              EIXO X (dias da semana)
              - dataKey="name": Campo dos dados a exibir
              - stroke="#666": Cor do eixo
            */}
            <XAxis dataKey="name" stroke="#666" />
            
            {/* EIXO Y (valores numéricos) */}
            <YAxis stroke="#666" />
            
            {/* 
              TOOLTIP (caixa de informação ao passar o mouse)
              Estilizado para combinar com o tema escuro
            */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            
            {/* 
              ÁREA DE ALUNOS (dourada)
              - type="monotone": Linha suave
              - fill="url(#colorAlunos)": Usa o gradiente definido acima
            */}
            <Area
              type="monotone"
              dataKey="alunos"
              stroke="#D4AF37"
              fillOpacity={1}
              fill="url(#colorAlunos)"
              name="Alunos"
            />
            
            {/* ÁREA DE TREINOS (verde) */}
            <Area
              type="monotone"
              dataKey="treinos"
              stroke="#22C55E"
              fillOpacity={1}
              fill="url(#colorTreinos)"
              name="Treinos"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* 
          LEGENDA DO GRÁFICO
          Indica o significado de cada cor
        */}
        <div className="mt-4 flex justify-center gap-6">
          {/* Legenda - Alunos */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Alunos</span>
          </div>
          {/* Legenda - Treinos */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Treinos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
