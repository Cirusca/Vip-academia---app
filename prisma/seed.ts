import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma/client"

/**
 * Seed de desenvolvimento (idempotente). Cria 1 profissional + 1 aluno no MESMO
 * gym, com hash bcrypt, e um plano de exemplo do profissional.
 *
 * Standalone (client próprio, sem `server-only`) para rodar via tsx/`db seed`.
 * Credenciais são SÓ para dev — nunca usar em produção.
 */

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL ausente.")

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const GYM = "gym-demo"
const DEV_PASSWORD = "treino123" // ≥8, letra+número (RN-USR-04)

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10)

  const prof = await prisma.user.upsert({
    where: { email: "prof@vip.dev" },
    update: {},
    create: {
      email: "prof@vip.dev",
      name: "Profa. Paula",
      roles: ["profissional"],
      passwordHash,
      gymId: GYM,
      cref: "012345-G/SP",
    },
  })

  const aluno = await prisma.user.upsert({
    where: { email: "aluno@vip.dev" },
    update: {},
    create: {
      email: "aluno@vip.dev",
      name: "Aluno Alex",
      roles: ["aluno"],
      passwordHash,
      gymId: GYM,
    },
  })

  // Plano de exemplo do profissional (só cria se ainda não houver nenhum dele).
  const existing = await prisma.workoutPlan.count({
    where: { gymId: GYM, createdBy: prof.id },
  })
  if (existing === 0) {
    await prisma.workoutPlan.create({
      data: {
        gymId: GYM,
        createdBy: prof.id,
        name: "Treino A — Full Body",
        day: "Segunda",
        level: "iniciante",
        estDuration: 50,
        estCalories: 350,
        exercises: {
          create: [
            { name: "Agachamento", sets: 3, reps: "10-12", rest: "60s", muscle: "Pernas", order: 1 },
            { name: "Supino reto", sets: 3, reps: "8-12", rest: "60s", muscle: "Peito", order: 2 },
            { name: "Remada curvada", sets: 3, reps: "10-12", rest: "60s", muscle: "Costas", order: 3 },
          ],
        },
      },
    })
  }

  // Fase 2 — atribui o plano de exemplo ao aluno (RN-ATR), idempotente. Sem isso
  // o `/treinos` do aluno fica vazio (ele só vê planos ATRIBUÍDOS a ele).
  const plan = await prisma.workoutPlan.findFirst({
    where: { gymId: GYM, createdBy: prof.id },
    select: { id: true },
  })
  if (plan) {
    const hasAssignment = await prisma.assignment.findFirst({
      where: { workoutPlanId: plan.id, alunoId: aluno.id, status: "ativa" },
      select: { id: true },
    })
    if (!hasAssignment) {
      await prisma.assignment.create({
        data: {
          gymId: GYM,
          workoutPlanId: plan.id,
          alunoId: aluno.id,
          assignedBy: prof.id,
          status: "ativa",
        },
      })
    }
  }

  // Fase 3 — vínculo ativo prof↔aluno (idempotente). Necessário para o gate de
  // atribuição (RN-ATR-02/RN-VIN-06) e para o aluno ver "seu profissional".
  const existingLink = await prisma.link.findFirst({
    where: { gymId: GYM, professionalId: prof.id, alunoId: aluno.id, status: "ativo" },
    select: { id: true },
  })
  if (!existingLink) {
    await prisma.link.create({
      data: {
        gymId: GYM,
        professionalId: prof.id,
        alunoId: aluno.id,
        status: "ativo",
      },
    })
  }

  // Fase 3 — 1 WorkoutLog concluído de exemplo (ontem), com snapshot dos
  // exercícios do plano (RN-EXE-09). Dá histórico/streak inicial ao aluno.
  const existingLog = await prisma.workoutLog.findFirst({
    where: { gymId: GYM, alunoId: aluno.id, status: "concluido" },
    select: { id: true },
  })
  if (!existingLog && plan) {
    const planExercises = await prisma.exercise.findMany({
      where: { workoutPlanId: plan.id },
      orderBy: { order: "asc" },
    })
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayDate = new Date(yesterday.toISOString().slice(0, 10) + "T00:00:00.000Z")

    await prisma.workoutLog.create({
      data: {
        gymId: GYM,
        alunoId: aluno.id,
        workoutPlanId: plan.id,
        status: "concluido",
        date: yesterdayDate,
        startedAt: new Date(Date.now() - 50 * 60_000),
        concludedAt: new Date(),
        durationMin: 50,
        caloriesBurned: 350,
        exerciseLogs: {
          create: planExercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            muscle: ex.muscle,
            videoUrl: ex.videoUrl,
            instructions: ex.instructions,
            order: ex.order,
            completed: true,
          })),
        },
      },
    })
  }

  console.log(
    `Seed OK — gym=${GYM} | prof=${prof.email} | aluno=${aluno.email} | senha dev="${DEV_PASSWORD}"`,
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error("Seed FALHOU:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
