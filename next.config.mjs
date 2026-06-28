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
  // TODO(Fase 0.6): remover apos configurar ESLint e zerar os erros reais de TS.
  // Mantido temporariamente porque o build honesto ainda nao foi habilitado.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
