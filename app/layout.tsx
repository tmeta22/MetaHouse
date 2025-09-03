import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataProvider } from '@/contexts/DataContext'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meta Family',
  description: 'A comprehensive family management hub for organizing schedules, tracking subscriptions, and managing family activities',
  generator: 'Next.js',
  applicationName: 'Meta Family',
  keywords: ['family', 'management', 'schedule', 'subscriptions', 'tasks', 'organization'],
  authors: [{ name: 'Meta Family Team' }],
  creator: 'Meta Family',
  publisher: 'Meta Family',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meta Family',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <ServiceWorkerProvider>
            <DataProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </DataProvider>
          </ServiceWorkerProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
