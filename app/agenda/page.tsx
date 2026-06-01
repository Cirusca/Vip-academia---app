/**
 * ============================================================================
 * FITPRO ACADEMIA - PAGINA DE AGENDA
 * ============================================================================
 * 
 * Pagina de gerenciamento de agenda e agendamentos da academia.
 * Exibe calendario, lista de horarios e permite agendar novos compromissos.
 * 
 * FUNCIONALIDADES:
 * - Visualizacao de calendario mensal
 * - Lista de agendamentos do dia selecionado
 * - Filtros por tipo de agendamento
 * - Formulario de novo agendamento
 * - Integracao com personal trainers
 * 
 * ESTADOS GERENCIADOS:
 * - Data selecionada no calendario
 * - Lista de agendamentos filtrada
 * - Modal de novo agendamento
 * 
 * ROTA: /agenda
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
} from "lucide-react"

/**
 * Dados mockados de agendamentos
 * 
 * Estrutura:
 * - id: Identificador unico
 * - title: Titulo do agendamento
 * - type: Tipo (treino, avaliacao, reuniao)
 * - time: Horario
 * - duration: Duracao em minutos
 * - client: Nome do cliente/aluno
 * - trainer: Personal responsavel
 * - location: Local do agendamento
 * - status: confirmed, pending, cancelled
 * 
 * TODO: Integrar com API/banco de dados
 */
const appointments = [
  {
    id: 1,
    title: "Treino Personalizado",
    type: "treino",
    time: "07:00",
    duration: 60,
    client: "Maria Silva",
    trainer: "Carlos Mendes",
    location: "Sala 1",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Avaliacao Fisica",
    type: "avaliacao",
    time: "09:00",
    duration: 45,
    client: "Joao Santos",
    trainer: "Fernanda Lima",
    location: "Sala de Avaliacao",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Aula de Yoga",
    type: "treino",
    time: "10:30",
    duration: 60,
    client: "Ana Costa",
    trainer: "Fernanda Lima",
    location: "Sala 2",
    status: "pending",
  },
  {
    id: 4,
    title: "Treino Funcional",
    type: "treino",
    time: "14:00",
    duration: 50,
    client: "Pedro Oliveira",
    trainer: "Ricardo Santos",
    location: "Area Externa",
    status: "confirmed",
  },
  {
    id: 5,
    title: "Reuniao de Equipe",
    type: "reuniao",
    time: "17:00",
    duration: 30,
    client: "-",
    trainer: "Todos",
    location: "Sala de Reunioes",
    status: "confirmed",
  },
]

/**
 * Nomes dos dias da semana em portugues
 * Usado na navegacao do calendario
 */
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

/**
 * Nomes dos meses em portugues
 * Usado no cabecalho do calendario
 */
const months = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

/**
 * Componente AgendaPage
 * 
 * Pagina completa de agenda com:
 * - Navegacao de mes/ano
 * - Grade de calendario
 * - Lista de agendamentos do dia
 * - Resumo de metricas
 * 
 * @returns JSX da pagina de agenda
 */
export default function AgendaPage() {
  /** Data atualmente selecionada no calendario */
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  /** Mes/ano sendo visualizado (pode ser diferente do selecionado) */
  const [currentMonth, setCurrentMonth] = useState(new Date())

  /**
   * Navega para o mes anterior
   */
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  /**
   * Navega para o proximo mes
   */
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  /**
   * Gera array de dias para renderizar no calendario
   * Inclui dias do mes anterior/proximo para completar semanas
   */
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    // Dias do mes anterior (para completar primeira semana)
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }

    // Dias do mes atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }

    return days
  }

  /**
   * Retorna cor do badge baseado no tipo de agendamento
   * @param type - Tipo do agendamento
   * @returns Classes CSS para o badge
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case "treino":
        return "bg-primary/20 text-primary"
      case "avaliacao":
        return "bg-blue-500/20 text-blue-500"
      case "reuniao":
        return "bg-purple-500/20 text-purple-500"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  /**
   * Retorna cor do badge baseado no status
   * @param status - Status do agendamento
   * @returns Classes CSS para o badge
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500"
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "cancelled":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const days = getDaysInMonth()
  const today = new Date()

  return (
    <AppLayout>
      {/* Cabecalho da pagina */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e compromissos
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Grid principal: calendario + lista de agendamentos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CALENDARIO - Ocupa 1 coluna em desktop */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader className="pb-2">
            {/* Navegacao de mes */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-semibold text-foreground">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cabecalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
              {weekDays.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((item, index) => {
                const isToday =
                  item.day === today.getDate() &&
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear()
                
                const isSelected =
                  item.day === selectedDate.getDate() &&
                  currentMonth.getMonth() === selectedDate.getMonth() &&
                  currentMonth.getFullYear() === selectedDate.getFullYear()

                return (
                  <button
                    key={index}
                    disabled={!item.isCurrentMonth}
                    onClick={() =>
                      item.day &&
                      setSelectedDate(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), item.day)
                      )
                    }
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm
                      transition-colors
                      ${!item.isCurrentMonth ? "text-muted-foreground/30" : ""}
                      ${isToday ? "bg-primary/20 text-primary font-semibold" : ""}
                      ${isSelected && !isToday ? "bg-secondary text-foreground" : ""}
                      ${item.isCurrentMonth && !isToday && !isSelected ? "hover:bg-secondary/50" : ""}
                    `}
                  >
                    {item.day}
                  </button>
                )
              })}
            </div>

            {/* Legenda de cores */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Treino</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Avaliacao</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Reuniao</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE AGENDAMENTOS - Ocupa 2 colunas em desktop */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Agendamentos do Dia
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors"
                >
                  {/* Coluna de horario */}
                  <div className="text-center min-w-[60px]">
                    <p className="font-semibold text-foreground">
                      {appointment.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.duration}min
                    </p>
                  </div>

                  {/* Linha divisoria */}
                  <div className="w-px h-16 bg-border" />

                  {/* Informacoes do agendamento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {appointment.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge className={getTypeColor(appointment.type)}>
                            {appointment.type}
                          </Badge>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status === "confirmed"
                              ? "Confirmado"
                              : appointment.status === "pending"
                              ? "Pendente"
                              : "Cancelado"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes: cliente, trainer, local */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {appointment.client}
                      </span>
                      <span className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                            {appointment.trainer.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {appointment.trainer}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {appointment.location}
                      </span>
                    </div>
                  </div>

                  {/* Botoes de acao */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">48</p>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/20 p-2">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
