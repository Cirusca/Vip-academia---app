/**
 * ============================================================================
 * FITPRO ACADEMIA - COMPONENTE PERSONAL TRAINER LIST
 * ============================================================================
 * 
 * Lista de personal trainers com busca, filtros e formulário de cadastro.
 * Exibe cards detalhados com informações e métricas de cada profissional.
 * 
 * INFORMAÇÕES EXIBIDAS POR TRAINER:
 * - Avatar com iniciais do nome
 * - Nome e anos de experiência
 * - Status de disponibilidade
 * - Especialidades (badges)
 * - Métricas: avaliação, quantidade de alunos, certificações
 * - Contato (email, telefone)
 * - Botões de ação (Agendar, Ver Perfil)
 * 
 * FORMULÁRIO DE CADASTRO:
 * - Nome completo
 * - Email e telefone
 * - CREF (registro profissional)
 * - Especialidades
 * - Anos de experiência
 * - Certificações
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  Star,
  Mail,
  Award,
  Users,
  Calendar,
  ChevronRight,
  Filter,
} from "lucide-react"

/**
 * Dados mockados dos personal trainers
 * 
 * Estrutura:
 * - id: Identificador único
 * - name: Nome completo do profissional
 * - email: Email de contato
 * - phone: Telefone de contato
 * - specialties: Array de especialidades
 * - rating: Avaliação média (0-5)
 * - students: Quantidade de alunos ativos
 * - experience: Tempo de experiência
 * - available: Se está disponível para novos alunos
 * - certifications: Lista de certificações
 * 
 * TODO: Integrar com API/banco de dados
 */
const trainers = [
  {
    id: 1,
    name: "Carlos Mendes",
    email: "carlos@fitpro.com",
    phone: "(11) 99999-1234",
    specialties: ["Musculacao", "Funcional"],
    rating: 4.9,
    students: 45,
    experience: "8 anos",
    available: true,
    certifications: ["CREF", "Personal Trainer", "Funcional"],
  },
  {
    id: 2,
    name: "Fernanda Lima",
    email: "fernanda@fitpro.com",
    phone: "(11) 99999-5678",
    specialties: ["Pilates", "Yoga"],
    rating: 4.8,
    students: 38,
    experience: "6 anos",
    available: true,
    certifications: ["CREF", "Pilates", "Yoga"],
  },
  {
    id: 3,
    name: "Ricardo Santos",
    email: "ricardo@fitpro.com",
    phone: "(11) 99999-9012",
    specialties: ["Crossfit", "HIIT"],
    rating: 4.7,
    students: 52,
    experience: "10 anos",
    available: false,
    certifications: ["CREF", "Crossfit L2", "Nutricao Esportiva"],
  },
  {
    id: 4,
    name: "Amanda Costa",
    email: "amanda@fitpro.com",
    phone: "(11) 99999-3456",
    specialties: ["Danca", "Aerobico"],
    rating: 4.9,
    students: 30,
    experience: "5 anos",
    available: true,
    certifications: ["CREF", "Danca", "Aerobico"],
  },
]

/**
 * Componente PersonalTrainerList
 * 
 * Gerencia estados de:
 * - search: Termo de busca para filtrar trainers
 * - showForm: Visibilidade do formulário de cadastro
 * 
 * @returns JSX com lista de personal trainers
 */
export function PersonalTrainerList() {
  /** Estado do termo de busca */
  const [search, setSearch] = useState("")
  
  /** Estado de visibilidade do formulário */
  const [showForm, setShowForm] = useState(false)

  /**
   * Filtra trainers baseado no termo de busca
   * Busca em nome e especialidades
   */
  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialties.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
  )

  return (
    <div className="space-y-6">
      {/* 
        BARRA DE AÇÕES
        Campo de busca e botões de filtro/cadastro
      */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Campo de busca com ícone */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
            aria-label="Buscar personal trainers"
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Personal
          </Button>
        </div>
      </div>

      {/* 
        FORMULÁRIO DE CADASTRO
        Exibido condicionalmente quando showForm é true
        Borda lateral dourada para destaque visual
      */}
      {showForm && (
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-foreground">
              Cadastrar Novo Personal Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grid de 2 colunas em telas maiores */}
            <form className="grid gap-4 sm:grid-cols-2">
              {/* Nome completo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <Input
                  placeholder="Nome do personal"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Telefone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Telefone
                </label>
                <Input
                  placeholder="(00) 00000-0000"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* CREF */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  CREF
                </label>
                <Input
                  placeholder="000000-G/SP"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Especialidades - ocupa 2 colunas */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Especialidades
                </label>
                <Input
                  placeholder="Ex: Musculacao, Funcional, Crossfit"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Anos de experiência */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Anos de Experiencia
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Certificações */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Certificacoes
                </label>
                <Input
                  placeholder="Ex: Personal Trainer, Nutricao"
                  className="bg-secondary border-border"
                />
              </div>
              
              {/* Botões de ação do formulário */}
              <div className="sm:col-span-2 flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground"
                >
                  Cadastrar Personal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 
        GRID DE CARDS DOS TRAINERS
        2 colunas em desktop, 1 em mobile
      */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTrainers.map((trainer) => (
          <Card
            key={trainer.id}
            className="bg-card border-border hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-4 md:p-6">
              {/* Layout horizontal com avatar e informações */}
              <div className="flex gap-3 md:gap-4">
                {/* Avatar com iniciais */}
                <Avatar className="h-12 w-12 md:h-16 md:w-16 shrink-0 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm md:text-lg font-bold">
                    {trainer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                
                {/* Informações do trainer */}
                <div className="flex-1 min-w-0">
                  {/* Cabeçalho: nome, experiência e status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                        {trainer.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {trainer.experience} de experiencia
                      </p>
                    </div>
                    
                    {/* Badge de disponibilidade */}
                    <Badge
                      variant={trainer.available ? "default" : "secondary"}
                      className={`shrink-0 text-xs ${
                        trainer.available
                          ? "bg-green-500/20 text-green-500"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {trainer.available ? "Disponivel" : "Ocupado"}
                      </span>
                      <span className="sm:hidden">
                        {trainer.available ? "Disp." : "Ocup."}
                      </span>
                    </Badge>
                  </div>

                  {/* Badges de especialidades */}
                  <div className="mt-2 md:mt-3 flex flex-wrap gap-1">
                    {trainer.specialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="border-primary/50 text-primary text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* Métricas: avaliação, alunos, certificações */}
                  <div className="mt-3 md:mt-4 grid grid-cols-3 gap-1 md:gap-2 text-center">
                    {/* Avaliação */}
                    <div className="rounded-lg bg-secondary/50 p-1.5 md:p-2">
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current" />
                        <span className="font-semibold text-xs md:text-sm">
                          {trainer.rating}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        Avaliacao
                      </p>
                    </div>
                    
                    {/* Quantidade de alunos */}
                    <div className="rounded-lg bg-secondary/50 p-1.5 md:p-2">
                      <div className="flex items-center justify-center gap-1 text-foreground">
                        <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        <span className="font-semibold text-xs md:text-sm">
                          {trainer.students}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        Alunos
                      </p>
                    </div>
                    
                    {/* Certificações */}
                    <div className="rounded-lg bg-secondary/50 p-1.5 md:p-2">
                      <div className="flex items-center justify-center gap-1 text-foreground">
                        <Award className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        <span className="font-semibold text-xs md:text-sm">
                          {trainer.certifications.length}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        Cert.
                      </p>
                    </div>
                  </div>

                  {/* Email - oculto em mobile */}
                  <div className="mt-3 md:mt-4 hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {trainer.email}
                    </span>
                  </div>

                  {/* Botões de ação */}
                  <div className="mt-3 md:mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border text-xs md:text-sm h-8 md:h-9"
                    >
                      <Calendar className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Agendar</span>
                      <span className="sm:hidden">Ag.</span>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground text-xs md:text-sm h-8 md:h-9"
                    >
                      <span className="hidden sm:inline">Ver Perfil</span>
                      <span className="sm:hidden">Perfil</span>
                      <ChevronRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
