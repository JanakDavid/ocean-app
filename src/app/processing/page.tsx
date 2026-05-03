'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'

const STAGE_COUNT = 6

// ── Pixel cat ──────────────────────────────────────────────────────────────
const PixelCat = memo(function PixelCat({
  boost, onPet, ariaLabel,
}: {
  boost: boolean
  onPet: () => void
  ariaLabel: string
}) {
  const orange = 'var(--clay)'
  const white  = 'var(--bone)'
  return (
    <svg
      className={`pixel-cat${boost ? ' boost' : ''}`}
      width="64" height="64"
      viewBox="0 0 16 16"
      onClick={onPet}
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPet() } }}
    >
      {/* Tail — curls behind on LEFT */}
      <g className="cat-tail" fill={orange}>
        <rect x="2" y="9"  width="1" height="1" />
        <rect x="1" y="8"  width="1" height="1" />
        <rect x="0" y="7"  width="1" height="1" />
        <rect x="0" y="5"  width="1" height="2" />
        <rect x="1" y="4"  width="1" height="1" />
      </g>

      {/* Body */}
      <g fill={orange}>
        {/* Ears */}
        <rect x="3" y="1" width="1" height="1" />
        <rect x="3" y="2" width="2" height="1" />
        <rect x="10" y="1" width="1" height="1" />
        <rect x="9"  y="2" width="2" height="1" />
        {/* Head */}
        <rect x="3" y="3" width="8" height="1" />
        <rect x="2" y="4" width="10" height="3" />
        {/* Neck */}
        <rect x="3" y="7" width="9" height="1" />
        {/* Body (sitting) */}
        <rect x="2" y="8"  width="10" height="3" />
        <rect x="2" y="11" width="11" height="2" />
        {/* Back haunch */}
        <rect x="12" y="9" width="1" height="2" />
        {/* Front legs */}
        <rect x="3" y="13" width="2" height="2" />
        <rect x="8" y="13" width="2" height="2" />
        {/* Paw pads */}
        <rect x="3" y="15" width="3" height="1" />
        <rect x="8" y="15" width="3" height="1" />
      </g>

      {/* White details */}
      <g fill={white}>
        {/* Inner ears */}
        <rect x="3"  y="2" width="1" height="1" />
        <rect x="10" y="2" width="1" height="1" />
        {/* Muzzle */}
        <rect x="6" y="6" width="3" height="1" />
        {/* Chest */}
        <rect x="6" y="7" width="3" height="1" />
        <rect x="6" y="8" width="4" height="3" />
        {/* Belly */}
        <rect x="6" y="11" width="3" height="2" />
        {/* Socks */}
        <rect x="3"  y="15" width="1" height="1" />
        <rect x="5"  y="15" width="1" height="1" />
        <rect x="8"  y="15" width="1" height="1" />
        <rect x="10" y="15" width="1" height="1" />
        {/* Eyes */}
        <rect className="cat-eye" x="5" y="5" width="1" height="1" />
        <rect className="cat-eye" x="9" y="5" width="1" height="1" />
      </g>

      {/* Front paw — reaches right toward loader on boost */}
      <g className="cat-paw">
        <rect x="10" y="13" width="2" height="2" fill={orange} />
        <rect x="10" y="15" width="2" height="1" fill={white} />
      </g>
    </svg>
  )
})

// ── Processing page ────────────────────────────────────────────────────────
export default function ProcessingPage() {
  const router = useRouter()
  const t = useTranslation()
  const { lang } = useLanguage()
  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)
  const [boost, setBoost] = useState(false)
  const boostTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const apiDone = useRef(false)
  const animDone = useRef(false)

  const pet = useCallback(() => {
    setBoost(true)
    if (boostTimer.current) clearTimeout(boostTimer.current)
    boostTimer.current = setTimeout(() => setBoost(false), 3000)
  }, [])

  const maybeNavigate = useCallback(() => {
    if (apiDone.current && animDone.current) {
      router.push('/result')
    }
  }, [router])

  // Submit answers to API while animation plays
  useEffect(() => {
    const answersRaw = sessionStorage.getItem('testAnswers')
    const userDataRaw = sessionStorage.getItem('userData')
    if (!answersRaw) { router.push('/test'); return }

    const answers = JSON.parse(answersRaw)
    const userData = userDataRaw ? JSON.parse(userDataRaw) : {}

    const controller = new AbortController()

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, userData, lang }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          sessionStorage.setItem('resultData', JSON.stringify({
            results: data.results,
            id: data.id,
            userData,
          }))
          sessionStorage.setItem('resultLang', lang)
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Submit error:', err)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          apiDone.current = true
          maybeNavigate()
        }
      })

    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animation stage timers — count only, display uses t.processing.stages
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let idx = 0; idx < STAGE_COUNT; idx++) {
      timers.push(setTimeout(() => setStage(idx), idx * 900))
    }
    const totalDuration = STAGE_COUNT * 900 + 400
    timers.push(setTimeout(() => setDone(true), totalDuration))
    timers.push(setTimeout(() => {
      animDone.current = true
      maybeNavigate()
    }, totalDuration + 1000))
    return () => {
      timers.forEach(clearTimeout)
      if (boostTimer.current) clearTimeout(boostTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen">
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(48px, 10vh, 128px) clamp(24px, 6vw, 96px)',
      }}>
        <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>

          {/* Cat + loading ring */}
          <div
            onClick={pet}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, margin: '0 auto 40px', width: 'fit-content',
              padding: '8px 12px', cursor: 'pointer',
            }}
          >
            <PixelCat boost={boost} onPet={pet} ariaLabel={t.processing.catAriaLabel} />

            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <svg
                className={`loading-ring${boost ? ' loading-boost' : ''}`}
                width="88" height="88" viewBox="0 0 88 88"
              >
                <circle cx="44" cy="44" r="40" fill="none" stroke="var(--hairline)" strokeWidth="1" />
                <circle cx="44" cy="4"  r="6" fill="var(--clay)"  />
                <circle cx="84" cy="44" r="4" fill="var(--ultra)" />
                <circle cx="44" cy="84" r="5" fill="var(--solar)" />
                <circle cx="4"  cy="44" r="4" fill="var(--moss)"  />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span
                  className={`loading-dot${boost ? ' loading-boost' : ''}`}
                  style={{ display: 'block', width: 10, height: 10, background: 'var(--ink)', borderRadius: '50%' }}
                />
              </div>
            </div>
          </div>

          <p className="eyebrow" style={{ marginBottom: 24 }}>
            {done ? t.processing.completeEyebrow : t.processing.processingEyebrow}
          </p>

          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)',
            marginBottom: 32,
          }}>
            {done ? (
              <>{t.processing.readyH1}</>
            ) : (
              <>
                {t.processing.composingH1.pre}{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{t.processing.composingH1.italic}</span>
                {t.processing.composingH1.post}
              </>
            )}
          </h1>

          {/* Thin indeterminate progress bar */}
          <div
            className={`loading-bar${boost ? ' loading-boost' : ''}`}
            style={{
              position: 'relative', height: 2, background: 'var(--bone-deep)',
              overflow: 'hidden', maxWidth: 320, margin: '0 auto 40px',
            }}
          />

          {/* Stage checklist */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: 420, textAlign: 'left' }}>
            {t.processing.stages.map((s, idx) => {
              const reached  = idx <= stage
              const complete = idx < stage || done
              return (
                <li key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0',
                  opacity: reached ? 1 : 0.3,
                  transition: 'opacity 300ms ease',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, flexShrink: 0 }}>
                    {complete ? (
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path d="M2 7.5L6 11L12 3.5" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
                      </svg>
                    ) : reached ? (
                      <span className="loading-dot" style={{ width: 8, height: 8, background: 'var(--clay)', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ width: 8, height: 8, border: '1px solid var(--ink-4)', borderRadius: '50%' }} />
                    )}
                  </span>
                  <span style={{
                    fontSize: 14, color: complete ? 'var(--ink)' : 'var(--ink-2)',
                    fontWeight: idx === stage && !done ? 500 : 400,
                  }}>
                    {s}
                  </span>
                </li>
              )
            })}
          </ul>

        </div>
      </div>
    </div>
  )
}
