'use client'

import { useEffect, useState, type ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

const cleanDesc = (text: string) => (text || '').replace(/<br\s*\/?>/gi, ' ').trim()

interface FacetResult {
  facet: number
  title: string
  text: string
  score: number
  count: number
  result: string
}

interface TraitResult {
  domain: string
  title: string
  shortDescription: string
  description: string
  score: number
  count: number
  result: string
  facets: FacetResult[]
}

export default function ResultPage() {
  const router = useRouter()
  const t = useTranslation()
  const { lang } = useLanguage()
  const [results, setResults] = useState<TraitResult[]>([])
  const [resultId, setResultId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('Profile')
  const [resultDate, setResultDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [openTrait, setOpenTrait] = useState<string | null>(null)
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    async function processResults() {
      try {
        const cachedRaw = sessionStorage.getItem('resultData')
        const storedLang = (sessionStorage.getItem('resultLang') as 'en' | 'cs' | null) ?? lang
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw)
          setResults(cached.results)
          setResultId(cached.id)
          const name = (cached.userData?.firstName || '').trim()
          setDisplayName(name || t.result.anonymousName)
          setResultDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
          setLoading(false)
          setAiLoading(true)
          fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: cached.results, firstName: cached.userData?.firstName || null, lang: storedLang }),
          })
            .then(r => r.json())
            .then(evalData => { if (evalData.evaluation) setAiEvaluation(evalData.evaluation) })
            .catch(err => console.error('AI eval error:', err))
            .finally(() => setAiLoading(false))
          return
        }

        const answersRaw = sessionStorage.getItem('testAnswers')
        const userDataRaw = sessionStorage.getItem('userData')
        if (!answersRaw) { router.push('/test'); return }

        const answers = JSON.parse(answersRaw)
        const userData = userDataRaw ? JSON.parse(userDataRaw) : {}

        const name = (userData?.firstName || '').trim()
        setDisplayName(name || t.result.anonymousName)
        setResultDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))

        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, userData }),
        })
        const data = await response.json()
        if (data.error) { setError(t.result.error); return }

        setResults(data.results)
        setResultId(data.id)
        setAiLoading(true)
        fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results: data.results, firstName: userData?.firstName || null, lang }),
        })
          .then(r => r.json())
          .then(evalData => { if (evalData.evaluation) setAiEvaluation(evalData.evaluation) })
          .catch(err => console.error('AI eval error:', err))
          .finally(() => setAiLoading(false))
      } catch (err) {
        console.error('Error processing results:', err)
        setError(t.result.error)
      } finally {
        setLoading(false)
      }
    }
    processResults()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleCopy = () => {
    if (resultId) {
      navigator.clipboard.writeText(resultId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{
          background: 'var(--bone)', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            {t.result.loading}
          </p>
        </main>
      </>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <Navbar />
        <main style={{
          background: 'var(--bone)', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--clay)' }}>{error}</p>
        </main>
      </>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────
  return (
    <div className="screen">
      <Navbar className="no-print" />

      {/* Masthead */}
      <section id="masthead" style={{
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px) 64px',
        maxWidth: 960, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          {t.result.eyebrow.replace('{date}', resultDate)}
        </p>
        <h1 className="display" style={{ fontSize: 'clamp(56px, 8vw, 128px)' }}>
          {displayName}.
        </h1>
        <p className="body-lg" style={{ marginTop: 32, maxWidth: 560 }}>
          {t.result.body}
        </p>
      </section>

      {/* Trait list — expandable */}
      <section style={{ padding: '0 clamp(24px, 6vw, 96px) 96px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--hairline)' }}>
          {results.map(trait => {
            const domain = trait.domain as 'O' | 'C' | 'E' | 'A' | 'N'
            const color = `var(--trait-${domain})`
            const scorePercent = Math.round((trait.score / (trait.count * 5)) * 100)
            const open = openTrait === domain

            const enName = translations.en.result.traitNames[domain]
            const csName = translations.cs.result.traitNames[domain]
            const traitDisplayName = lang === 'en'
              ? `${enName} (${csName})`
              : `${csName} (${enName})`

            return (
              <div key={domain} style={{ borderBottom: '1px solid var(--hairline)', padding: '36px 0' }}>
                {/* Header row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{
                      fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 700,
                      color, lineHeight: 1, letterSpacing: '-0.02em',
                    }}>
                      {domain}
                    </span>
                    <span className="h3" style={{ fontWeight: 500 }}>{traitDisplayName}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, color, fontWeight: 600 }}>
                    {scorePercent}
                  </span>
                </div>

                {/* Score bar — 6px */}
                <div style={{ height: 6, background: 'var(--bone-deep)', position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${scorePercent}%`, background: color, height: 6 }} />
                </div>

                {/* Description */}
                {t.result.traitDescriptions[domain] ? (
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16, maxWidth: 760 }}>
                    {t.result.traitDescriptions[domain]}
                  </p>
                ) : (
                  <p
                    style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16, maxWidth: 760 }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanDesc(trait.description || trait.shortDescription || '')) }}
                  />
                )}

                {/* Toggle */}
                <button
                  onClick={() => setOpenTrait(open ? null : domain)}
                  style={{
                    background: 'none', border: 0, cursor: 'pointer', padding: 0,
                    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
                    color, letterSpacing: '0.01em',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 150ms ease',
                  }}>↑</span>
                  {open ? t.result.hideFacets : t.result.showFacets}
                </button>

                {/* Facet dropdown */}
                {open && (
                  <div className="fade-in" style={{
                    marginTop: 20,
                    borderLeft: `2px solid ${color}`,
                    paddingLeft: 20,
                  }}>
                    {trait.facets.map((f, fi) => {
                      const facetPercent = Math.round((f.score / (f.count * 5)) * 100)
                      return (
                        <div key={f.facet} style={{
                          padding: '14px 0',
                          borderBottom: fi < trait.facets.length - 1 ? '1px solid var(--hairline)' : 0,
                        }}>
                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'baseline',
                            marginBottom: 8,
                          }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                              {lang === 'cs'
                                ? `${t.result.facetNames[f.title] ?? f.title} (${f.title})`
                                : f.title}
                            </span>
                            <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color }}>
                              {facetPercent}
                            </span>
                          </div>
                          <div style={{ height: 2, background: 'var(--bone-deep)', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, width: `${facetPercent}%`, background: color, height: 2 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Interpretation */}
      <section style={{ padding: '64px clamp(24px, 6vw, 96px) 96px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <p className="eyebrow">{t.result.interpretationEyebrow}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, background: 'var(--clay)', borderRadius: '50%' }} />
            <span className="label" style={{ color: 'var(--ink-3)' }}>{t.result.aiLabel}</span>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 4.5vw, 56px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)',
          marginBottom: 48, fontWeight: 400,
        }}>
          {displayName}&apos;s{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>Big Five</span>{' '}
          profile.
        </h2>

        {aiLoading && (
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2vw, 24px)',
            lineHeight: 1.5, letterSpacing: '-0.005em', color: 'var(--ink-4)',
            fontStyle: 'italic',
          }}>
            {t.result.aiLoading}
          </p>
        )}

        {aiEvaluation && !aiLoading && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }: ComponentProps<'h2'>) => (
                <h2 style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
                  color: 'var(--ink-3)', letterSpacing: '0.18em', textTransform: 'uppercase',
                  marginTop: 40, marginBottom: 16,
                  paddingTop: 40, borderTop: '1px solid var(--hairline)',
                }}>
                  {children}
                </h2>
              ),
              h3: ({ children }: ComponentProps<'h3'>) => (
                <h3 style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
                  color: 'var(--ink-3)', letterSpacing: '0.18em', textTransform: 'uppercase',
                  marginTop: 32, marginBottom: 12,
                }}>
                  {children}
                </h3>
              ),
              p: ({ children }: ComponentProps<'p'>) => (
                <p style={{
                  fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2vw, 22px)',
                  lineHeight: 1.55, letterSpacing: '-0.005em', color: 'var(--ink)',
                  marginBottom: 20,
                }}>
                  {children}
                </p>
              ),
              strong: ({ children }: ComponentProps<'strong'>) => (
                <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{children}</strong>
              ),
              em: ({ children }: ComponentProps<'em'>) => (
                <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>{children}</em>
              ),
              ul: ({ children }: ComponentProps<'ul'>) => (
                <ul style={{ paddingLeft: 20, marginBottom: 20 }}>{children}</ul>
              ),
              ol: ({ children }: ComponentProps<'ol'>) => (
                <ol style={{ paddingLeft: 20, marginBottom: 20 }}>{children}</ol>
              ),
              li: ({ children }: ComponentProps<'li'>) => (
                <li style={{
                  fontFamily: 'var(--serif)', fontSize: 'clamp(16px, 1.6vw, 18px)',
                  lineHeight: 1.6, color: 'var(--ink)', marginBottom: 8,
                }}>
                  {children}
                </li>
              ),
              hr: () => (
                <hr style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: '40px 0' }} />
              ),
              blockquote: ({ children }: ComponentProps<'blockquote'>) => (
                <blockquote style={{
                  borderLeft: '2px solid var(--hairline)', paddingLeft: 20, margin: '24px 0',
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  fontSize: 13, lineHeight: 1.55, color: 'var(--ink-3)',
                }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {aiEvaluation}
          </ReactMarkdown>
        )}

        {!aiLoading && !aiEvaluation && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-4)' }}>
            {t.result.aiError}
          </p>
        )}
      </section>

      {/* Hiring disclaimer */}
      <section style={{
        padding: '32px clamp(24px, 6vw, 96px)', maxWidth: 720, margin: '0 auto',
        borderTop: '1px solid var(--hairline)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--ink-4)', lineHeight: 1.65 }}>
          {t.result.hiringDisclaimer}
        </p>
      </section>

      {/* ID & actions */}
      {resultId && (
        <section style={{
          padding: '48px clamp(24px, 6vw, 96px)', maxWidth: 720, margin: '0 auto',
          borderTop: '1px solid var(--hairline)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p className="label" style={{ marginBottom: 10 }}>{t.result.resultIdLabel}</p>
              <p className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{resultId}</p>
            </div>
            <div className="no-print" style={{ display: 'flex', gap: 16 }}>
              <button onClick={handleCopy} className="btn btn--ghost" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
                {copied ? t.result.copiedBtn : t.result.copyBtn}
              </button>
              <button onClick={() => window.print()} className="btn" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
                {t.result.downloadBtn} <span className="arrow" />
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer className="no-print" />
    </div>
  )
}
