'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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

const TRAIT_COLORS: Record<string, string> = {
  O: '#1D4ED8',
  C: '#15803D',
  E: '#EA580C',
  A: '#CA8A04',
  N: '#B91C1C',
}

const TRAIT_LABELS: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
}

export default function ResultPage() {
  const router = useRouter()
  const [results, setResults] = useState<TraitResult[]>([])
  const [resultId, setResultId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null)

  useEffect(() => {
    async function processResults() {
      try {
        const answersRaw = sessionStorage.getItem('testAnswers')
        const userDataRaw = sessionStorage.getItem('userData')

        if (!answersRaw) {
          router.push('/test')
          return
        }

        const answers = JSON.parse(answersRaw)
        const userData = userDataRaw ? JSON.parse(userDataRaw) : {}

        // Submit to API — scoring happens server-side
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, userData }),
        })

        const data = await response.json()

        if (data.error) {
          setError('Something went wrong processing your results.')
          return
        }

        setResults(data.results)
        setResultId(data.id)
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
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
              Calculating your results...
            </p>
            <p style={{ fontSize: '14px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
              This will take just a moment.
            </p>
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '16px', color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}>{error}</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: '64px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            Your Results
          </p>
          <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
            Your Personality Profile
          </h1>
          <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '64px', fontFamily: 'Inter, sans-serif' }}>
            Based on the IPIP-NEO-PI assessment — the most scientifically validated personality model in psychology.
          </p>

          {/* Trait Score Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '64px' }}>
            {results.map(trait => {
              const color = TRAIT_COLORS[trait.domain] || '#1A1A1A'
              const label = TRAIT_LABELS[trait.domain] || trait.title
              const scorePercent = Math.round((trait.score / (trait.count * 5)) * 100)
              const isExpanded = expandedTrait === trait.domain

              return (
                <div key={trait.domain}>
                  {/* Trait header */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                        {trait.domain}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: 'Inter, sans-serif' }}>
                      {scorePercent}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#F5F5F5', marginBottom: '12px' }}>
                    <div style={{ height: '10px', backgroundColor: color, width: `${scorePercent}%`, transition: 'width 600ms ease' }} />
                  </div>

                  {/* Short description */}
                  <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                    {trait.shortDescription}
                  </p>

                  {/* Expand facets */}
                  <button
                    onClick={() => setExpandedTrait(isExpanded ? null : trait.domain)}
                    style={{ fontSize: '13px', color: color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  >
                    {isExpanded ? '↑ Hide facets' : '↓ Show facets'}
                  </button>

                  {/* Facets */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {trait.facets.map(facet => {
                        const facetPercent = Math.round((facet.score / (facet.count * 5)) * 100)
                        return (
                          <div key={facet.facet}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>{facet.title}</span>
                              <span style={{ fontSize: '13px', color, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{facetPercent}</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', backgroundColor: '#F5F5F5' }}>
                              <div style={{ height: '4px', backgroundColor: color, width: `${facetPercent}%` }} />
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

          {/* UUID Section */}
          {resultId && (
            <div style={{ marginBottom: '64px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                Your Result ID
              </p>
              <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '16px', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                Save this ID to retrieve your results at any time — no account needed.
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ padding: '16px 24px', backgroundColor: '#F5F5F5', border: '1px solid #2D2D2D', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#1A1A1A', letterSpacing: '0.05em', flex: 1, minWidth: '200px' }}>
                  {resultId}
                </div>
                <button
                  onClick={handleCopy}
                  style={{ padding: '16px 24px', backgroundColor: copied ? '#15803D' : '#1A1A1A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 500, whiteSpace: 'nowrap', transition: 'background-color 150ms ease' }}
                >
                  {copied ? '✓ Copied' : 'Copy ID'}
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F5F5F5', marginBottom: '64px' }} />

          {/* Take test again */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => { sessionStorage.clear(); router.push('/test') }}
              style={{ padding: '14px 32px', backgroundColor: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', fontSize: '16px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: 500 }}
            >
              Take the test again
            </button>
          </div>

        </div>
      </main>
    </>
  )
}