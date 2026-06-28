/**
 * Erros de autorização (compartilhados servidor-only).
 *
 * Convenção anti-IDOR (docs/REVISAO_PLANO_E_SEGURANCA.md): falha de autorização
 * sobre um recurso responde **404**, nunca 403 — não revelar a existência de um
 * recurso de outro tenant/dono. Só a AUSÊNCIA de sessão é tratada à parte
 * (NotAuthenticatedError → redirecionar ao login).
 */

/** Não há sessão autenticada. Camada acima deve redirecionar ao login. */
export class NotAuthenticatedError extends Error {
  constructor(message = "Não autenticado.") {
    super(message)
    this.name = "NotAuthenticatedError"
  }
}

/**
 * Recurso inexistente OU inacessível para esta sessão (cross-tenant, sem posse,
 * sem vínculo, papel insuficiente). Mesma resposta para todos os casos — é a
 * defesa contra IDOR (RN-SEG, riscos 🔴 da revisão de segurança).
 */
export class NotFoundError extends Error {
  constructor(message = "Recurso não encontrado.") {
    super(message)
    this.name = "NotFoundError"
  }
}
