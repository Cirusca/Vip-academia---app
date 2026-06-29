-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('pendente', 'ativo', 'inativo');

-- CreateTable
CREATE TABLE "links" (
  "id"              TEXT        NOT NULL,
  "gymId"           TEXT        NOT NULL,
  "professionalId"  TEXT        NOT NULL,
  "alunoId"         TEXT,
  "status"          "LinkStatus" NOT NULL DEFAULT 'pendente',
  "inviteCode"      TEXT,
  "inviteExpiresAt" TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "links_gymId_professionalId_status_idx"
  ON "links"("gymId", "professionalId", "status");

CREATE INDEX "links_gymId_alunoId_status_idx"
  ON "links"("gymId", "alunoId", "status");

-- Partial unique: só 1 link ATIVO por aluno por gym (RN-VIN-03).
-- Garante que o aluno não possa aceitar dois convites (índice bloqueia a 2ª escrita).
CREATE UNIQUE INDEX "links_aluno_gym_ativo_unique"
  ON "links"("alunoId", "gymId")
  WHERE "status" = 'ativo';

-- Partial unique: inviteCode único enquanto não-nulo (um código = um convite).
CREATE UNIQUE INDEX "links_invite_code_unique"
  ON "links"("inviteCode")
  WHERE "inviteCode" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "links"
  ADD CONSTRAINT "links_professionalId_fkey"
  FOREIGN KEY ("professionalId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "links"
  ADD CONSTRAINT "links_alunoId_fkey"
  FOREIGN KEY ("alunoId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
