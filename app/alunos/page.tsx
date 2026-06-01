/**
 * ============================================================================
 * FITPRO ACADEMIA - PÁGINA DE ALUNOS
 * ============================================================================
 * 
 * Página para gerenciamento completo dos alunos da academia.
 * Permite visualizar, buscar, filtrar e gerenciar todos os alunos cadastrados.
 * 
 * FUNCIONALIDADES:
 * - Busca por nome ou email
 * - Filtros por plano e status
 * - Cards com estatísticas (total, ativos, pendentes, inativos)
 * - Lista detalhada de alunos com informações de contato
 * - Botão para cadastrar novo aluno
 * 
 * ESTRUTURA DA PÁGINA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ [🔍 Buscar...]                      [Filtros] [+ Novo Aluno]           │
 * │─────────────────────────────────────────────────────────────────────────│
 * │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
 * │ │Total: 324│ │Ativos:298│ │Pend.: 18 │ │Inat.: 8  │                    │
 * │ └──────────┘ └──────────┘ └──────────┘ └──────────┘                    │
 * │─────────────────────────────────────────────────────────────────────────│
 * │ Lista de Alunos                                                         │
 * │ ┌─────────────────────────────────────────────────────────────────────┐│
 * │ │ [JS] João Silva    ● Ativo   | joao@email.com | Premium | 15/01/26 ││
 * │ │ [MS] Maria Santos  ● Ativo   | maria@email.com | Básico | 20/02/26 ││
 * │ │ ...                                                                  ││
 * │ └─────────────────────────────────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * STATUS DOS ALUNOS:
 * - Ativo: Matrícula em dia, pode frequentar a academia
 * - Pendente: Pagamento pendente ou documentação incompleta
 * - Inativo: Matrícula cancelada ou vencida
 * 
 * PLANOS DISPONÍVEIS:
 * - Básico: Acesso à musculação
 * - Premium: Musculação + aulas coletivas
 * - VIP: Todos os benefícios + personal trainer
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
} from "lucide-react"

/**
 * Dados mockados de alunos
 * 
 * Estrutura:
 * - id: Identificador único do aluno
 * - name: Nome completo
 * - email: Email para contato
 * - phone: Telefone para contato
 * - plan: Tipo de plano (Básico/Premium/VIP)
 * - status: Status da matrícula (Ativo/Inativo)
 * - trainer: Personal trainer responsável (se houver)
 * - joinDate: Data de matrícula
 * 
 * TODO: Integrar com API/banco de dados
 * Sugestão: Usar useSWR para fetch e cache dos dados
 */
const students = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-1111",
    plan: "Premium",
    status: "Ativo",
    trainer: "Carlos Mendes",
    joinDate: "15/01/2026",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 99999-2222",
    plan: "Básico",
    status: "Ativo",
    trainer: "Fernanda Lima",
    joinDate: "20/02/2026",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "(11) 99999-3333",
    plan: "Premium",
    status: "Ativo",
    trainer: "Ricardo Santos",
    joinDate: "10/03/2026",
  },
  {
    id: 4,
    name: "Ana Paula",
    email: "ana@email.com",
    phone: "(11) 99999-4444",
    plan: "VIP",
    status: "Inativo",
    trainer: "Amanda Costa",
    joinDate: "05/01/2026",
  },
  {
    id: 5,
    name: "Lucas Oliveira",
    email: "lucas@email.com",
    phone: "(11) 99999-5555",
    plan: "Básico",
    status: "Ativo",
    trainer: "Carlos Mendes",
    joinDate: "25/04/2026",
  },
  {
    id: 6,
    name: "Carla Ferreira",
    email: "carla@email.com",
    phone: "(11) 99999-6666",
    plan: "Premium",
    status: "Ativo",
    trainer: "Fernanda Lima",
    joinDate: "12/05/2026",
  },
]

/**
 * Componente da página de Alunos
 * 
 * Gerencia estado de busca e renderiza lista filtrada de alunos.
 * Inclui estatísticas, busca e lista detalhada.
 * 
 * @returns JSX da página de Alunos
 */
export default function AlunosPage() {
  /**
   * Estado para o termo de busca
   * Usado para filtrar alunos por nome ou email
   */
  const [search, setSearch] = useState("")

  /**
   * Filtra alunos baseado no termo de busca
   * Busca case-insensitive em nome e email
   */
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout
      title="Alunos"
      subtitle="Gerencie os alunos cadastrados na academia."
    >
      {/* 
        BARRA DE AÇÕES
        Contém busca, filtros e botão de adicionar
        Responsivo: empilha verticalmente em mobile
      */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Campo de busca com ícone */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
            aria-label="Buscar alunos"
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* 
        CARDS DE ESTATÍSTICAS
        Grid responsivo: 2 colunas em mobile, 4 em tablet+
      */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {/* Total de alunos */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">324</p>
            <p className="text-sm text-muted-foreground">Total de Alunos</p>
          </CardContent>
        </Card>
        
        {/* Alunos ativos */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-500">298</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        
        {/* Alunos com pendências */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-500">18</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        
        {/* Alunos inativos */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-500">8</p>
            <p className="text-sm text-muted-foreground">Inativos</p>
          </CardContent>
        </Card>
      </div>

      {/* 
        LISTA DE ALUNOS
        Card contendo lista detalhada com informações de cada aluno
      */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Itera sobre alunos filtrados */}
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 md:gap-4 rounded-lg bg-secondary/30 p-3 md:p-4 hover:bg-secondary/50 transition-colors"
              >
                {/* 
                  Avatar com iniciais do aluno
                  Borda sutil para separação visual
                */}
                <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0 border border-border">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                
                {/* Informações principais do aluno */}
                <div className="flex-1 min-w-0">
                  {/* Nome e status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-foreground text-sm md:text-base truncate">
                      {student.name}
                    </h4>
                    {/* 
                      Badge de status com cor condicional
                      Verde para ativo, vermelho para inativo
                    */}
                    <Badge
                      variant={
                        student.status === "Ativo" ? "default" : "secondary"
                      }
                      className={
                        student.status === "Ativo"
                          ? "bg-green-500/20 text-green-500 text-xs"
                          : "bg-red-500/20 text-red-500 text-xs"
                      }
                    >
                      {student.status}
                    </Badge>
                  </div>
                  
                  {/* Informações de contato */}
                  <div className="mt-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </span>
                    {/* Telefone oculto em mobile */}
                    <span className="hidden md:flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {student.phone}
                    </span>
                  </div>
                </div>
                
                {/* Informações adicionais - ocultas em mobile */}
                <div className="hidden md:block text-right shrink-0">
                  {/* Badge do plano */}
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {student.plan}
                  </Badge>
                  {/* Data de matrícula */}
                  <p className="mt-1 text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3" />
                    {student.joinDate}
                  </p>
                </div>
                
                {/* Botão de mais opções */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground shrink-0 h-8 w-8"
                  aria-label="Mais opções"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
