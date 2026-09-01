import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/hooks/use-theme'
import { ToastProvider } from '@/components/editor/toast-provider'
import { ErrorBoundary } from '@/components/editor/error-boundary'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Synced — Collaborative Code Editor',
  description: 'The collaborative workspace for code, live preview, and modern product teams. Build together in real-time with live cursors, chat, and instant preview.',
  keywords: ['code editor', 'collaborative', 'real-time', 'web development', 'team coding', 'live preview'],
  authors: [{ name: 'Synced' }],
  creator: 'Synced',
  publisher: 'Synced',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://synced.dev',
    title: 'Synced — Collaborative Code Editor',
    description: 'The collaborative workspace for code, live preview, and modern product teams.',
    siteName: 'Synced',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Synced - Collaborative Code Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synced — Collaborative Code Editor',
    description: 'The collaborative workspace for code, live preview, and modern product teams.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <TooltipProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
