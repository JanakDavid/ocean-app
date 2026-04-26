'use client'

import { useEffect, useState, type ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
        // Check if processing page already submitted
        const cachedRaw = sessionStorage.getItem('resultData')
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw)
          setResults(cached.results)
          setResultId(cached.id)
          const name = (cached.userData?.firstName || '').trim()
          setDisplayName(name || 'Your')
          setResultDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
          setLoading(false)
          // Still fetch AI evaluation
          setAiLoading(true)
          fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: cached.results, firstName: cached.userData?.firstName || null }),
          })
            .then(r => r.json())
            .then(evalData => { if (evalData.evaluation) setAiEvaluation(evalData.evaluation) })
            .catch(err => console.error('AI eval error:', err))
            .finally(() => setAiLoading(false))
          return
        }

        // Fallback: submit from here if processing page was skipped
        const answersRaw = sessionStorage.getItem('testAnswers')
        const userDataRaw = sessionStorage.getItem('userData')
        if (!answersRaw) { router.push('/test'); return }

        const answers = JSON.parse(answersRaw)
        const userData = userDataRaw ? JSON.parse(userDataRaw) : {}

        const name = (userData?.firstName || '').trim()
        setDisplayName(name || 'Your')
        setResultDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))

        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, userData }),
        })
        const data = await response.json()
        if (data.error) { setError('Something went wrong processing your results.'); return }

        setResults(data.results)
        setResultId(data.id)
        setAiLoading(true)
        fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results: data.results, firstName: userData?.firstName || null }),
        })
          .then(r => r.json())
          .then(evalData => { if (evalData.evaluation) setAiEvaluation(evalData.evaluation) })
          .catch(err => console.error('AI eval error:', err))
          .finally(() => setAiLoading(false))
      } catch (err) {
        console.error('Error processing results:', err)
        setError('Something went wrong processing your results.')
      } finally {
        setLoading(false)
      }
    }
    processResults()
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
            Calculating your profile…
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
      <Navbar />

      {/* Masthead */}
      <section style={{
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px) 64px',
        maxWidth: 960, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Your result · {resultDate}</p>
        <h1 className="display" style={{ fontSize: 'clamp(56px, 8vw, 128px)' }}>
          {displayName}.
        </h1>
        <p className="body-lg" style={{ marginTop: 32, maxWidth: 560 }}>
          Five domain scores against the IPIP-NEO-PI reference cohort.
          Read each number as a percentile — 50 is exactly average.
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
                    <span className="h3" style={{ fontWeight: 500 }}>{trait.title}</span>
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
                <p
                  style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16, maxWidth: 760 }}
                  dangerouslySetInnerHTML={{ __html: cleanDesc(trait.description || trait.shortDescription || '') }}
                />

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
                  {open ? 'Hide facets' : 'Show facets'}
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
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{f.title}</span>
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
          <p className="eyebrow">Interpretation</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, background: 'var(--clay)', borderRadius: '50%' }} />
            <span className="label" style={{ color: 'var(--ink-3)' }}>Generated by AI</span>
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
            Generating your interpretation…
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
            AI interpretation could not be generated. Your scores are accurate and complete.
          </p>
        )}
      </section>

      {/* ID & actions */}
      {resultId && (
        <section style={{
          padding: '48px clamp(24px, 6vw, 96px)', maxWidth: 720, margin: '0 auto',
          borderTop: '1px solid var(--hairline)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p className="label" style={{ marginBottom: 10 }}>Result ID</p>
              <p className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{resultId}</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={handleCopy} className="btn btn--ghost" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
                {copied ? '✓ Copied' : 'Copy ID'}
              </button>
              <button onClick={() => window.print()} className="btn" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
                Download PDF <span className="arrow" />
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
