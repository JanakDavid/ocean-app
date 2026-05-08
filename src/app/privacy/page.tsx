'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTranslation } from '@/lib/useTranslation'

export default function PrivacyPage() {
  const t = useTranslation()
  const p = t.privacy

  return (
    <div className="screen">
      <Navbar />

      <main style={{
        maxWidth: 720, margin: '0 auto',
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px)',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>{p.eyebrow}</p>

        <h1 className="h1" style={{ marginBottom: 16 }}>{p.h1}</h1>

        <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 64 }}>
          {p.lastUpdated}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {p.sections.map((section, i) => (
            <div key={i}>
              <div style={{ height: 1, background: 'var(--hairline)', marginBottom: 24 }} />
              <h2 style={{
                fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 16,
                color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.005em',
              }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
