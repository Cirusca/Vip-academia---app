/**
 * ============================================================================
 * CONFIGURACAO NEXT.JS
 * ============================================================================
 *
 * PWA: o app permanece INSTALAVEL via public/manifest.json + icones
 * (add-to-home-screen), porém SEM service worker no MVP. O next-pwa foi
 * removido por estar abandonado e incompativel com Next 16/Turbopack.
 * Reavaliar @serwist/turbopack pos-MVP. Ver docs/REVISAO_PLANO_E_SEGURANCA.md.
 * ============================================================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build honesto: a validação de tipos do TypeScript NÃO é suprimida.
  // (typescript.ignoreBuildErrors e images.unoptimized foram removidos na Fase 0.)
}

export default nextConfig
