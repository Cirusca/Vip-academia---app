import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

/**
 * CONFIGURAÇÃO DE FONTES
 * 
 * Utilizamos as fontes Geist (Sans e Mono) do Google Fonts.
 * O Next.js otimiza automaticamente o carregamento das fontes.
 * O prefixo _ indica que são usadas via CSS variables, não diretamente.
 */
const _geist = Geist({ 
  subsets: ["latin"],
  // A fonte é aplicada via --font-sans no globals.css
});

const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  // A fonte é aplicada via --font-mono no globals.css
});

/**
 * METADADOS DA APLICAÇÃO
 * 
 * Configurações de SEO, PWA e compartilhamento social.
 * Estes metadados são renderizados no <head> de todas as páginas.
 */
export const metadata: Metadata = {
  // Título exibido na aba do navegador e resultados de busca
  title: 'VIP Academia',

  // Descrição para SEO e compartilhamento
  description: 'App de treino B2B2C para academias — profissional atribui, aluno executa.',

  // Identificação do gerador
  generator: 'next',

  // Palavras-chave para SEO
  keywords: ['academia', 'gestão', 'treinos', 'fitness', 'personal trainer', 'alunos'],

  // Autor do sistema
  authors: [{ name: 'VIP Academia' }],
  
  // Configuração do manifest para PWA (instalação como app)
  manifest: '/manifest.json',
  
  // Permite instalação como PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VIP Academia',
  },
  
  // Ícones para diferentes contextos
  icons: {
    // Ícone do navegador com suporte a tema claro/escuro
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    // Ícone para dispositivos Apple
    apple: '/apple-icon.png',
  },
}

/**
 * CONFIGURAÇÃO DE VIEWPORT
 * 
 * Otimizações para dispositivos móveis e PWA.
 * Separado do metadata para melhor organização.
 */
export const viewport: Viewport = {
  // Largura segue a largura do dispositivo
  width: 'device-width',
  
  // Escala inicial de 100%
  initialScale: 1,
  
  // Escala máxima (evita zoom excessivo)
  maximumScale: 1,
  
  // Permite zoom pelo usuário para acessibilidade
  userScalable: true,
  
  // Cor da barra de status no mobile (dourado da marca)
  themeColor: '#D4AF37',
}

/**
 * COMPONENTE DE LAYOUT RAIZ
 * 
 * Este componente envolve todas as páginas da aplicação.
 * É renderizado apenas uma vez e persiste entre navegações.
 * 
 * @param children - Conteúdo das páginas filhas
 * @returns JSX do layout HTML completo
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Idioma definido como português do Brasil
    // Classe bg-background garante cor de fundo correta antes do CSS carregar
    // suppressHydrationWarning é exigido pelo next-themes (a classe de tema é
    // aplicada no cliente antes da hidratação).
    <html lang="pt-BR" className="bg-background" suppressHydrationWarning>
      {/*
        Body com fonte sans-serif e anti-aliasing para texto suave.
        Os filhos são renderizados aqui, representando as páginas.
      */}
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Analytics da Vercel apenas em produção */}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
