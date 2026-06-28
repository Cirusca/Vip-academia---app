/**
 * Sanitiza um destino de redirect vindo do cliente (callbackUrl).
 *
 * Aceita SOMENTE caminhos same-origin: começam com "/" mas não com "//" nem
 * "/\" (ambos viram protocol-relative em alguns navegadores). Bloqueia URLs
 * absolutas (`https://evil.com`) e esquemas (`javascript:`) — anti open-redirect
 * / phishing. Qualquer valor inválido cai para "/".
 *
 * Função pura, sem dependências de servidor: pode ser usada no render e dentro
 * da server action (que relê o formData e por isso precisa sanitizar de novo).
 */
export function safeCallbackPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return "/"
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/"
  return raw
}
