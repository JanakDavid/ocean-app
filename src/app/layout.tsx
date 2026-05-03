import type { Metadata } from 'next'
import { Source_Serif_4, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { LanguageProvider } from '@/lib/LanguageContext'
import './globals.css'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OCEAN — Personality Assessment',
  description: 'A free, scientific Big Five personality assessment. Understand yourself better in 10 minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sourceSerif4.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  )
}
