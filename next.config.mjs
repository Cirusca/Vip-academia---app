/**
 * ============================================================================
 * FITPRO ACADEMIA - CONFIGURACAO NEXT.JS COM PWA
 * ============================================================================
 * 
 * Arquivo de configuracao do Next.js com suporte a PWA (Progressive Web App).
 * Permite instalacao do app em dispositivos mobile como um aplicativo nativo.
 * 
 * FUNCIONALIDADES PWA:
 * - Instalacao na tela inicial
 * - Funcionamento offline (cache)
 * - Icones personalizados
 * - Splash screen
 * - Push notifications (futuro)
 * 
 * CONFIGURACOES:
 * - dest: Diretorio de destino dos arquivos do service worker
 * - register: Registra automaticamente o service worker
 * - skipWaiting: Atualiza service worker imediatamente
 * - disable: Desabilita em desenvolvimento para facilitar debug
 * 
 * @author FitPro Academia
 * @version 1.0.0
 * @lastModified 2026-06-01
 * ============================================================================
 */

import withPWA from 'next-pwa'

/**
 * Configuracao do PWA
 * 
 * @property dest - Pasta onde os arquivos do SW serao gerados
 * @property register - Se deve registrar o SW automaticamente
 * @property skipWaiting - Atualiza o SW sem esperar
 * @property disable - Desabilita em desenvolvimento
 */
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Ignora erros de TypeScript durante o build
   * Util para prototipagem rapida
   * TODO: Remover em producao e corrigir todos os erros
   */
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /**
   * Desabilita otimizacao de imagens
   * Necessario para deploy em alguns ambientes
   */
  images: {
    unoptimized: true,
  },
}

export default pwaConfig(nextConfig)
