import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import ClientLayout from '@/components/layout/ClientLayout'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CareSync - Sentient Care Coordination Platform',
  description: 'AI-powered family care management system that transforms medical documents into actionable tasks. Experience the future of healthcare coordination.',
}

export const viewport: Viewport = {
  themeColor: '#0c0c1e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className={`${outfit.className} antialiased selection:bg-indigo-500/30 selection:text-white`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}