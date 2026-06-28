-- ============================================================================
-- Fase 2 — Assignment (atribuição de plano a aluno). Migração ADITIVA.
-- Escrita à mão e aplicada via `prisma migrate deploy` (sem autogeração), para
-- preservar o SQL bruto da Fase 1 (índice parcial de CREF / CHECKs) — ver
-- docs/HANDOFF.md §"Drift do Prisma".
-- ============================================================================

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ativa', 'pausada', 'concluida');

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ativa',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_gymId_alunoId_status_idx" ON "assignments"("gymId", "alunoId", "status");

-- CreateIndex
CREATE INDEX "assignments_gymId_workoutPlanId_status_idx" ON "assignments"("gymId", "workoutPlanId", "status");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- SQL BRUTO (regras de negócio que o schema Prisma não expressa) — Fase 2
-- ============================================================================

-- RN-ATR-08: no máximo UMA atribuição ATIVA por par (plano, aluno). Atribuições
-- `pausada`/`concluida` podem coexistir (histórico). Índice PARCIAL único — é o
-- que torna o reatribuir um no-op seguro mesmo sob concorrência.
CREATE UNIQUE INDEX "assignments_active_pair_unique"
  ON "assignments" ("workoutPlanId", "alunoId")
  WHERE "status" = 'ativa';
