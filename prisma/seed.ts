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
