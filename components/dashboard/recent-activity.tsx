/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE RECENT ACTIVITY
 * ============================================================================
 * 
 * Exibe um feed de atividades recentes dos alunos da academia.
 * Similar a uma timeline de redes sociais, mostrando ações em tempo real.
 * 
 * TIPOS DE ATIVIDADES:
 * - treino: Aluno completou ou iniciou um treino
 * - novo: Novo aluno se cadastrou na academia
 * - aula: Aluno agendou uma aula coletiva
 * 
 * ESTRUTURA VISUAL:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Atividades Recentes                                             │
 * │─────────────────────────────────────────────────────────────────│
 * │ [JS] João Silva completou o treino de peito        ✓  há 5 min │
 * │ [MS] Maria Santos se cadastrou na academia         +  há 15 min│
 * │ [PC] Pedro Costa iniciou treino de costas          🏋  há 22 min│
 * │ [AP] Ana Paula agendou aula de spinning            📅  há 30 min│
 * │ [LO] Lucas Oliveira completou treino de pernas     ✓  há 45 min│
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * CORES DOS ÍCONES:
 * - Verde (text-green-500): Ações completadas
 * - Dourado (text-primary): Novos cadastros
 * - Azul (text-blue-500): Treinos iniciados
 * - Roxo (text-purple-500): Agendamentos
 * 
 * DADOS:
 * Atualmente usa dados mockados. Para integrar com backend:
 * 1. Crie endpoint API com WebSocket ou polling para atualizações
 * 2. Use useSWR com refreshInterval para atualização periódica
 * 3. Considere Server-Sent Events para updates em tempo real
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Dumbbell, UserPlus, Calendar } from "lucide-react"

/**
 * Array de atividades recentes
 * 
 * Estrutura:
 * - id: Identificador único
 * - type: Tipo da atividade (treino, novo, aula)
 * - user: Nome do aluno
 * - action: Descrição da ação realizada
 * - time: Tempo relativo desde a ação
 * - icon: Componente de ícone do Lucide
 * - color: Classe Tailwind para cor do ícone
 * 
 * TODO: Substituir por dados em tempo real da API
 */
const activities = [
  {
    id: 1,
    type: "treino",
    user: "João Silva",
    action: "completou o treino de peito e tríceps",
    time: "há 5 min",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  {
    id: 2,
    type: "novo",
    user: "Maria Santos",
    action: "se cadastrou na academia",
    time: "há 15 min",
    icon: UserPlus,
    color: "text-primary",
  },
  {
    id: 3,
    type: "treino",
    user: "Pedro Costa",
    action: "iniciou treino de costas",
    time: "há 22 min",
    icon: Dumbbell,
    color: "text-blue-500",
  },
  {
    id: 4,
    type: "aula",
    user: "Ana Paula",
    action: "agendou aula de spinning",
    time: "há 30 min",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    id: 5,
    type: "treino",
    user: "Lucas Oliveira",
    action: "completou o treino de pernas",
    time: "há 45 min",
    icon: CheckCircle2,
    color: "text-green-500",
  },
]

/**
 * Componente RecentActivity
 * 
 * Renderiza uma lista de atividades recentes com avatar,
 * descrição e ícone indicativo do tipo de atividade.
 * 
 * @returns JSX com card contendo feed de atividades
 */
export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      {/* Cabeçalho do card */}
      <CardHeader>
        <CardTitle className="text-foreground">Atividades Recentes</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Container com espaçamento vertical entre itens */}
        <div className="space-y-4">
          {/* Itera sobre cada atividade para renderizar */}
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 rounded-lg bg-secondary/50 p-3"
            >
              {/* 
                AVATAR DO USUÁRIO
                Exibe as iniciais do nome do aluno
              */}
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {/* 
                    Gera iniciais a partir do nome
                    Ex: "João Silva" → "JS"
                  */}
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              
              {/* 
                ÁREA DE TEXTO
                Contém nome, ação e tempo
              */}
              <div className="flex-1 min-w-0">
                {/* 
                  Descrição da atividade
                  Nome em destaque (font-medium) seguido da ação
                */}
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                {/* Tempo relativo em tamanho menor */}
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              
              {/* 
                ÍCONE INDICATIVO
                Usa componente dinâmico com cor baseada no tipo
              */}
              <activity.icon className={`h-5 w-5 ${activity.color}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
