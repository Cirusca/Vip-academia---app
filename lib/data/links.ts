import "server-only"

import { randomBytes } from "node:crypto"
import type { SessionUser } from "@/lib/auth/session"
import { isProfissional, isAluno } from "@/lib/auth/session"
import { assertCan } from "@/lib/auth/assertCan"
import { NotFoundError } from "@/lib/auth/errors"
import { db, tenantWhere } from "@/lib/data/_scope"
import { AssignmentStatus, LinkStatus } from "@/lib/generated/prisma/enums"
import type { AcceptInviteInput, EndLinkInput } from "@/lib/validation/link"

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1_000 // 7 dias

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase()
}

export type InviteView = { inviteCode: string; expiresAt: Date }
export type LinkView = { id: string; professionalId: string; professionalName: string | null; status: string }
export type AlunoView = { linkId: string; alunoId: string; alunoName: string | null; alunoEmail: string }

/**
 * Profissional gera um código de convite para um aluno (RN-VIN-02).
 * Cada chamada cria um novo link pendente com código único.
 * O código é compartilhado manualmente (WhatsApp/in-person — sem e-mail no MVP).
 */
export async function createInvite(session: SessionUser): Promise<InviteView> {
  assertCan(session, "link:invite")
  const inviteCode = generateInviteCode()
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS)

  await db.link.create({
    data: {
      gymId: session.gymId,
      professionalId: session.userId,
      status: LinkStatus.pendente,
      inviteCode,
      inviteExpiresAt,
    },
  })
  return { inviteCode, expiresAt: inviteExpiresAt }
}

/**
 * Aluno aceita convite pelo código (RN-VIN-09).
 * Valida: código existe, não expirou, gym bate, aluno ainda não tem link ativo (RN-VIN-03).
 * Consumo: zera inviteCode + inviteExpiresAt para evitar reuso.
 */
export async function acceptInvite(session: SessionUser, input: AcceptInviteInput): Promise<void> {
  assertCan(session, "link:accept", { gymId: session.gymId, createdBy: session.userId })

  // Buscar link pelo código dentro do gym do aluno (anti cross-tenant).
  const link = await db.link.findFirst({
    where: {
      gymId: session.gymId,
      inviteCode: input.code,
      status: LinkStatus.pendente,
    },
    select: { id: true, gymId: true, professionalId: true, inviteExpiresAt: true },
  })
  if (!link) throw new NotFoundError()
  if (link.inviteExpiresAt && link.inviteExpiresAt < new Date()) throw new NotFoundError()

  // RN-VIN-03: aluno não pode ter mais de 1 link ativo por gym.
  const existing = await db.link.findFirst({
    where: tenantWhere(session, { alunoId: session.userId, status: LinkStatus.ativo }),
    select: { id: true },
  })
  if (existing) throw new NotFoundError()

  await db.link.update({
    where: { id: link.id },
    data: {
      alunoId: session.userId,
      status: LinkStatus.ativo,
      inviteCode: null,      // consumido — não reutilizável
      inviteExpiresAt: null,
    },
  })
}

/**
 * Encerra vínculo (RN-VIN-05). Pode ser chamado por qualquer das partes.
 * Autorização INLINE (não via assertCan): verifica se session.userId é
 * professionalId OU alunoId do link — dois campos distintos sem equivalente
 * em OwnedResource.createdBy. Anti-IDOR: link buscado por gymId + id.
 * Cascade: atribuições ativas do par vão para "pausada" (RN-ATR-07).
 */
export async function endLink(session: SessionUser, input: EndLinkInput): Promise<void> {
  const link = await db.link.findFirst({
    where: tenantWhere(session, { id: input.linkId, status: LinkStatus.ativo }),
    select: { id: true, gymId: true, professionalId: true, alunoId: true },
  })
  if (!link) throw new NotFoundError()

  // Autorização: somente as duas partes do vínculo podem encerrá-lo.
  const isParty =
    session.userId === link.professionalId || session.userId === link.alunoId
  if (!isParty) throw new NotFoundError()

  if (!link.alunoId) throw new NotFoundError() // link sem aluno não deveria existir como ativo

  await db.$transaction([
    // Pausar atribuições ativas que o profissional fez para este aluno (RN-ATR-07).
    db.assignment.updateMany({
      where: {
        gymId: link.gymId,
        assignedBy: link.professionalId,
        alunoId: link.alunoId,
        status: AssignmentStatus.ativa,
      },
      data: { status: AssignmentStatus.pausada },
    }),
    db.link.update({
      where: { id: link.id },
      data: { status: LinkStatus.inativo },
    }),
  ])
}

/** Profissional lista alunos com vínculo ativo no seu gym (RN-VIN-01/04). */
export async function listAlunos(session: SessionUser): Promise<AlunoView[]> {
  if (!isProfissional(session)) throw new NotFoundError()

  const links = await db.link.findMany({
    where: tenantWhere(session, { professionalId: session.userId, status: LinkStatus.ativo }),
    select: {
      id: true,
      alunoId: true,
      aluno: { select: { id: true, name: true, email: true } },
    },
  })

  return links
    .filter(l => l.aluno !== null)
    .map(l => ({
      linkId: l.id,
      alunoId: l.aluno!.id,
      alunoName: l.aluno!.name,
      alunoEmail: l.aluno!.email,
    }))
}

/** Aluno consulta o seu vínculo ativo (para onboarding/tela de perfil). */
export async function getActiveLink(session: SessionUser): Promise<LinkView | null> {
  if (!isAluno(session)) throw new NotFoundError()

  const link = await db.link.findFirst({
    where: tenantWhere(session, { alunoId: session.userId, status: LinkStatus.ativo }),
    select: {
      id: true,
      professionalId: true,
      professional: { select: { name: true } },
      status: true,
    },
  })
  if (!link) return null

  return {
    id: link.id,
    professionalId: link.professionalId,
    professionalName: link.professional.name,
    status: link.status,
  }
}
