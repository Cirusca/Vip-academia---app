/**
 * Dados MOCKADOS de planos de treino.
 *
 * Extraídos de `components/workouts/workout-details.tsx` (Fase 0). Esta é a única
 * fonte do mock; nenhum componente deve embutir dados de novo. Na Fase 1, a
 * fachada `lib/data/*` deixa de ler daqui e passa a consultar o Prisma — este
 * arquivo (e os demais mocks) é então descartado.
 */

import type { WorkoutPlan } from "@/lib/types"

export const workoutPlans: WorkoutPlan[] = [
  {
    id: "treino-a",
    name: "Treino A - Peito e Triceps",
    day: "Segunda / Quinta",
    duration: "45-50 min",
    calories: "320-400 kcal",
    exercises: [
      {
        id: 1,
        name: "Supino Reto",
        sets: 4,
        reps: "10-12",
        rest: "60s",
        muscle: "Peito",
        completed: true,
        videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
        videoThumb: "supino-reto",
        instructions:
          "Deite no banco com os pes apoiados no chao. Segure a barra com as maos na largura dos ombros. Desça a barra ate o peito e empurre para cima.",
      },
      {
        id: 2,
        name: "Supino Inclinado",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        muscle: "Peito Superior",
        completed: true,
        videoUrl: "https://www.youtube.com/embed/8iPEnn-ltC8",
        videoThumb: "supino-inclinado",
        instructions:
          "Ajuste o banco em 30-45 graus. Execute o movimento de forma controlada focando na parte superior do peito.",
      },
      {
        id: 3,
        name: "Crucifixo",
        sets: 3,
        reps: "12-15",
        rest: "45s",
        muscle: "Peito",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/eozdVDA78K0",
        videoThumb: "crucifixo",
        instructions:
          "Deite no banco com halteres. Abra os bracos em arco mantendo uma leve flexao nos cotovelos.",
      },
      {
        id: 4,
        name: "Triceps Pulley",
        sets: 4,
        reps: "12-15",
        rest: "45s",
        muscle: "Triceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
        videoThumb: "triceps-pulley",
        instructions:
          "Segure a barra com as maos na largura dos ombros. Mantenha os cotovelos junto ao corpo e estenda os bracos.",
      },
      {
        id: 5,
        name: "Triceps Frances",
        sets: 3,
        reps: "10-12",
        rest: "45s",
        muscle: "Triceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
        videoThumb: "triceps-frances",
        instructions:
          "Deite no banco segurando o halter acima da cabeca. Flexione os cotovelos descendo o peso atras da cabeca.",
      },
    ],
  },
  {
    id: "treino-b",
    name: "Treino B - Costas e Biceps",
    day: "Terca / Sexta",
    duration: "50-55 min",
    calories: "280-350 kcal",
    exercises: [
      {
        id: 1,
        name: "Puxada Frontal",
        sets: 4,
        reps: "10-12",
        rest: "60s",
        muscle: "Costas",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc",
        videoThumb: "puxada-frontal",
        instructions:
          "Segure a barra com pegada aberta. Puxe ate a altura do peito contraindo as costas.",
      },
      {
        id: 2,
        name: "Remada Curvada",
        sets: 4,
        reps: "10-12",
        rest: "60s",
        muscle: "Costas",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/kBWAon7ItDw",
        videoThumb: "remada-curvada",
        instructions:
          "Incline o tronco a 45 graus. Puxe a barra em direcao ao abdomen mantendo as costas retas.",
      },
      {
        id: 3,
        name: "Remada Unilateral",
        sets: 3,
        reps: "10-12",
        rest: "45s",
        muscle: "Costas",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/roCP6wCXPqo",
        videoThumb: "remada-unilateral",
        instructions:
          "Apoie um joelho no banco. Puxe o halter em direcao ao quadril contraindo as costas.",
      },
      {
        id: 4,
        name: "Rosca Direta",
        sets: 4,
        reps: "10-12",
        rest: "45s",
        muscle: "Biceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
        videoThumb: "rosca-direta",
        instructions:
          "Segure a barra com pegada supinada. Flexione os cotovelos subindo a barra ate os ombros.",
      },
      {
        id: 5,
        name: "Rosca Martelo",
        sets: 3,
        reps: "12-15",
        rest: "45s",
        muscle: "Biceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4",
        videoThumb: "rosca-martelo",
        instructions:
          "Segure os halteres com pegada neutra. Flexione alternadamente mantendo os cotovelos junto ao corpo.",
      },
    ],
  },
  {
    id: "treino-c",
    name: "Treino C - Pernas",
    day: "Quarta / Sabado",
    duration: "55-60 min",
    calories: "400-500 kcal",
    exercises: [
      {
        id: 1,
        name: "Agachamento Livre",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        muscle: "Quadriceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/Dy28eq2PjcM",
        videoThumb: "agachamento",
        instructions:
          "Posicione a barra nos trapezios. Agache ate as coxas ficarem paralelas ao chao.",
      },
      {
        id: 2,
        name: "Leg Press",
        sets: 4,
        reps: "10-12",
        rest: "60s",
        muscle: "Quadriceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/IZxyjW7MPJQ",
        videoThumb: "leg-press",
        instructions:
          "Posicione os pes na plataforma na largura dos ombros. Empurre controlando a descida.",
      },
      {
        id: 3,
        name: "Cadeira Extensora",
        sets: 3,
        reps: "12-15",
        rest: "45s",
        muscle: "Quadriceps",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0",
        videoThumb: "extensora",
        instructions:
          "Ajuste o equipamento. Estenda as pernas completamente contraindo o quadriceps.",
      },
      {
        id: 4,
        name: "Mesa Flexora",
        sets: 4,
        reps: "10-12",
        rest: "45s",
        muscle: "Posterior",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/1Tq3QdYUuHs",
        videoThumb: "flexora",
        instructions:
          "Deite na maquina com os calcanhares sob o rolo. Flexione as pernas ate 90 graus.",
      },
      {
        id: 5,
        name: "Panturrilha em Pe",
        sets: 4,
        reps: "15-20",
        rest: "30s",
        muscle: "Panturrilha",
        completed: false,
        videoUrl: "https://www.youtube.com/embed/-M4-G8p8fmc",
        videoThumb: "panturrilha",
        instructions:
          "Posicione os ombros sob as almofadas. Eleve os calcanhares ao maximo e desça controladamente.",
      },
    ],
  },
]
