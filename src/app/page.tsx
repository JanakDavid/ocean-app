'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTranslation } from '@/lib/useTranslation'

export default function HomePage() {
  const router = useRouter()
  const t = useTranslation()

  return (
    <div className="screen">
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: 'clamp(40px, 7vh, 96px) clamp(24px, 6vw, 96px) clamp(40px, 6vh, 80px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            background: 'var(--clay)', borderRadius: '50%',
            marginRight: 10, verticalAlign: 'middle',
          }} />
          {t.landing.eyebrow}
        </p>

        <h1 className="display" style={{ maxWidth: 1000 }}>
          {t.landing.h1.pre}{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{t.landing.h1.italic}</span>
          <br />
          {t.landing.h1.post}
        </h1>

        <p className="body-lg" style={{ marginTop: 24, maxWidth: 560 }}>
          {t.landing.body}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => router.push('/test')}>
            {t.landing.beginBtn} <span className="arrow" />
          </button>
          <button onClick={() => router.push('/results')} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontSize: 14, color: 'var(--ink-2)',
            textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: 'var(--ink-4)',
          }}>
            {t.landing.retrieveLink}
          </button>
        </div>
      </section>

      {/* Five dimensions */}
      <section style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(48px, 8vh, 96px)', maxWidth: 1200, margin: '0 auto' }}>
        <p className="eyebrow" style={{ marginBottom: 32 }}>{t.landing.dimensionsEyebrow}</p>

        <div>
          {t.landing.dimensions.map((dim, i, arr) => (
            <div key={dim.k} className="dimension-row" style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 2fr', gap: 32, alignItems: 'baseline',
              padding: '24px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 0,
              borderTop: i === 0 ? '1px solid var(--hairline)' : 0,
            }}>
              <span style={{
                fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 700, lineHeight: 1,
                color: `var(--trait-${dim.k})`, letterSpacing: '-0.02em',
              }}>
                {dim.k}
              </span>
              <span className="h3" style={{ fontWeight: 500 }}>{dim.name}</span>
              <span className="body dimension-gloss" style={{ color: 'var(--ink-2)', fontSize: 15 }}>{dim.gloss}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing note */}
      <section className="closing-section" style={{
        padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)',
        maxWidth: 1200, margin: '0 auto', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 3.5vw, 44px)',
          lineHeight: 1.25, letterSpacing: '-0.01em', maxWidth: 760, margin: '0 auto', color: 'var(--ink)',
        }}>
          {t.landing.closingQuote}
        </p>
        <button className="btn" style={{ marginTop: 48 }} onClick={() => router.push('/test')}>
          {t.landing.beginTestBtn} <span className="arrow" />
        </button>
      </section>

      <Footer />
    </div>
  )
}
