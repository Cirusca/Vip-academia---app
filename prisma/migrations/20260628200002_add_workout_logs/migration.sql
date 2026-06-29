-- CreateEnum
CREATE TYPE "WorkoutLogStatus" AS ENUM ('em_andamento', 'concluido');

-- CreateTable
CREATE TABLE "workout_logs" (
  "id"             TEXT              NOT NULL,
  "gymId"          TEXT              NOT NULL,
  "alunoId"        TEXT              NOT NULL,
  "workoutPlanId"  TEXT              NOT NULL,
  "status"         "WorkoutLogStatus" NOT NULL DEFAULT 'em_andamento',
  "date"           DATE,
  "startedAt"      TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "concludedAt"    TIMESTAMP(3),
  "durationMin"    INTEGER,
  "caloriesBurned" INTEGER,
  "createdAt"      TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)      NOT NULL,

  CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_logs" (
  "id"           TEXT        NOT NULL,
  "workoutLogId" TEXT        NOT NULL,
  "name"         TEXT        NOT NULL,
  "sets"         INTEGER     NOT NULL,
  "reps"         TEXT        NOT NULL,
  "rest"         TEXT        NOT NULL,
  "muscle"       TEXT        NOT NULL,
  "videoUrl"     TEXT,
  "instructions" TEXT,
  "order"        INTEGER     NOT NULL,
  "completed"    BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_logs_gymId_alunoId_status_idx"
  ON "workout_logs"("gymId", "alunoId", "status");

CREATE INDEX "workout_logs_gymId_alunoId_date_idx"
  ON "workout_logs"("gymId", "alunoId", "date");

-- Partial unique: 1 log em_andamento por par aluno+plano (suporte a recuperação RN-EXE-11).
CREATE UNIQUE INDEX "workout_logs_aluno_plan_andamento_unique"
  ON "workout_logs"("alunoId", "workoutPlanId")
  WHERE "status" = 'em_andamento';

CREATE INDEX "exercise_logs_workoutLogId_order_idx"
  ON "exercise_logs"("workoutLogId", "order");

-- AddForeignKey
ALTER TABLE "workout_logs"
  ADD CONSTRAINT "workout_logs_alunoId_fkey"
  FOREIGN KEY ("alunoId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workout_logs"
  ADD CONSTRAINT "workout_logs_workoutPlanId_fkey"
  FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exercise_logs"
  ADD CONSTRAINT "exercise_logs_workoutLogId_fkey"
  FOREIGN KEY ("workoutLogId") REFERENCES "workout_logs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
