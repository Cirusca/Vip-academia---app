-- CreateEnum
CREATE TYPE "Role" AS ENUM ('profissional', 'aluno');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ativo', 'inativo');

-- CreateEnum
CREATE TYPE "WorkoutPlanStatus" AS ENUM ('ativo', 'inativo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "roles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ativo',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "gymId" TEXT NOT NULL,
    "cref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "day" TEXT,
    "estDuration" INTEGER,
    "estCalories" INTEGER,
    "level" TEXT,
    "status" "WorkoutPlanStatus" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "rest" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "videoUrl" TEXT,
    "instructions" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_gymId_status_idx" ON "users"("gymId", "status");

-- CreateIndex
CREATE INDEX "users_gymId_deletedAt_idx" ON "users"("gymId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "workout_plans_gymId_status_idx" ON "workout_plans"("gymId", "status");

-- CreateIndex
CREATE INDEX "workout_plans_gymId_createdBy_status_idx" ON "workout_plans"("gymId", "createdBy", "status");

-- CreateIndex
CREATE INDEX "exercises_workoutPlanId_order_idx" ON "exercises"("workoutPlanId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_workoutPlanId_order_key" ON "exercises"("workoutPlanId", "order");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- SQL BRUTO (regras de negócio que o schema Prisma não expressa) — Fase 1
-- ============================================================================

-- RN-USR-05: CREF único entre PROFISSIONAIS ATIVOS por academia (ignora alunos
-- e contas inativas). O formato (UF + número) é validado em zod no servidor.
CREATE UNIQUE INDEX "users_cref_active_unique"
  ON "users" ("gymId", "cref")
  WHERE "cref" IS NOT NULL
    AND "status" = 'ativo'
    AND 'profissional'::"Role" = ANY ("roles");

-- RN-PLA-04 / RN-INV-04: séries >= 1.
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_sets_min" CHECK ("sets" >= 1);

-- RN-PLA-05: ordem 1-based (>= 1).
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_order_min" CHECK ("order" >= 1);
