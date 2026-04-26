'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const dimensions = [
  { k: 'O', name: 'Openness',          gloss: 'Imagination, curiosity, breadth of interest.' },
  { k: 'C', name: 'Conscientiousness', gloss: 'Orderliness, diligence, self-discipline.' },
  { k: 'E', name: 'Extraversion',      gloss: 'Warmth, assertiveness, appetite for stimulus.' },
  { k: 'A', name: 'Agreeableness',     gloss: 'Trust, altruism, cooperative tendency.' },
  { k: 'N', name: 'Neuroticism',       gloss: 'Emotional reactivity, recovery from stress.' },
]

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="screen">
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 96px) clamp(64px, 10vh, 128px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 40 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            background: 'var(--clay)', borderRadius: '50%',
            marginRight: 10, verticalAlign: 'middle',
          }} />
          A behavioural instrument · 2026
        </p>

        <h1 className="display" style={{ maxWidth: 1000 }}>
          Know the <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>architecture</span><br />
          of a person.
        </h1>

        <p className="body-lg" style={{ marginTop: 40, maxWidth: 560 }}>
          Five dimensions. 120 items. Ten minutes. No account.
          A legible, scientifically grounded portrait of who you are.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 64 }}>
          <button className="btn" onClick={() => router.push('/test')}>
            Begin <span className="arrow" />
          </button>
          <button onClick={() => router.push('/results')} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontSize: 14, color: 'var(--ink-2)',
            textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: 'var(--ink-4)',
          }}>
            Retrieve existing result
          </button>
        </div>
      </section>

      {/* Five dimensions */}
      <section style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(80px, 12vh, 160px)', maxWidth: 1200, margin: '0 auto' }}>
        <p className="eyebrow" style={{ marginBottom: 48 }}>The five dimensions</p>

        <div>
          {dimensions.map((t, i, arr) => (
            <div key={t.k} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 2fr', gap: 32, alignItems: 'baseline',
              padding: '28px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 0,
              borderTop: i === 0 ? '1px solid var(--hairline)' : 0,
            }}>
              <span style={{
                fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 700, lineHeight: 1,
                color: `var(--trait-${t.k})`, letterSpacing: '-0.02em',
              }}>
                {t.k}
              </span>
              <span className="h3" style={{ fontWeight: 500 }}>{t.name}</span>
              <span className="body" style={{ color: 'var(--ink-2)', fontSize: 15 }}>{t.gloss}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing note */}
      <section style={{
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px)',
        maxWidth: 1200, margin: '0 auto', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 3.5vw, 44px)',
          lineHeight: 1.25, letterSpacing: '-0.01em', maxWidth: 760, margin: '0 auto', color: 'var(--ink)',
        }}>
          Built on the IPIP-NEO-PI — open science, open instrument, entirely free.
        </p>
        <button className="btn" style={{ marginTop: 48 }} onClick={() => router.push('/test')}>
          Begin the test <span className="arrow" />
        </button>
      </section>

      <Footer />
    </div>
  )
}
