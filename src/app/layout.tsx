import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}