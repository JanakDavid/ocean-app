'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

interface FacetResult {
  facet: number
  title: string
  score: number
  count: number
  result: string
}

interface TraitResult {
  domain: string
  title: string
  shortDescription: string
  score: number
  count: number
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

export default function ResultsPage() {
  const [inputId, setInputId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<TraitResult[] | null>(null)
  const [resultMeta, setResultMeta] = useState<{ id: string; firstName?: string; department?: string; createdAt: string } | null>(null)
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!inputId.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)
    setResultMeta(null)

    try {
      const response = await fetch(`/api/result?id=${inputId.trim()}`)
      const data = await response.json()

      if (data.error) {
        setError('Result not found. Please check your ID and try again.')
        return
      }

      setResults(data.results)
      setResultMeta({
        id: data.id,
        firstName: data.firstName,
        department: data.department,
        createdAt: data.createdAt,
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: '64px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            View Results
          </p>
          <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            Retrieve your results
          </h1>
          <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '48px', fontFamily: 'Inter, sans-serif' }}>
            Enter the unique ID you received after completing the test.
          </p>

          {/* Search Input */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. 3dd4ca19-647a-40dd-8910-4efc73879225"
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '14px 16px',
                fontSize: '14px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#1A1A1A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #2D2D2D',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.border = '2px solid #1A1A1A' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #2D2D2D' }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !inputId.trim()}
              style={{
                padding: '14px 32px',
                backgroundColor: loading || !inputId.trim() ? '#D4D4D4' : '#1A1A1A',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                cursor: loading || !inputId.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!loading && inputId.trim()) e.currentTarget.style.backgroundColor = '#EA580C' }}
              onMouseLeave={e => { if (!loading && inputId.trim()) e.currentTarget.style.backgroundColor = '#1A1A1A' }}
            >
              {loading ? 'Searching...' : 'Find Results'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', borderLeft: '3px solid #B91C1C', marginBottom: '32px' }}>
              <p style={{ fontSize: '14px', color: '#B91C1C', fontFamily: 'Inter, sans-serif' }}>{error}</p>
            </div>
          )}

          {/* Results */}
          {results && resultMeta && (
            <div>
              {/* Meta info */}
              <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF', border: '1px solid #F5F5F5', marginBottom: '48px' }}>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  {resultMeta.firstName && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>Name</p>
                      <p style={{ fontSize: '16px', color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>{resultMeta.firstName}</p>
                    </div>
                  )}
                  {resultMeta.department && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>Department</p>
                      <p style={{ fontSize: '16px', color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>{resultMeta.department}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>Completed</p>
                    <p style={{ fontSize: '16px', color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
                      {new Date(resultMeta.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trait bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {results.map(trait => {
                  const color = TRAIT_COLORS[trait.domain] || '#1A1A1A'
                  const label = TRAIT_LABELS[trait.domain] || trait.title
                  const scorePercent = Math.round((trait.score / (trait.count * 5)) * 100)
                  const isExpanded = expandedTrait === trait.domain

                  return (
                    <div key={trait.domain}>
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

                      <div style={{ width: '100%', height: '10px', backgroundColor: '#F5F5F5', marginBottom: '12px' }}>
                        <div style={{ height: '10px', backgroundColor: color, width: `${scorePercent}%` }} />
                      </div>

                      <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                        {trait.shortDescription}
                      </p>

                      <button
                        onClick={() => setExpandedTrait(isExpanded ? null : trait.domain)}
                        style={{ fontSize: '13px', color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                      >
                        {isExpanded ? '↑ Hide facets' : '↓ Show facets'}
                      </button>

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
            </div>
          )}

        </div>
      </main>
    </>
  )
}