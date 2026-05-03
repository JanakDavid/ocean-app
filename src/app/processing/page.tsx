'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PenguinLoader from '@/components/PenguinLoader'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'

const STAGE_COUNT = 6

// ── Processing page ────────────────────────────────────────────────────────
export default function ProcessingPage() {
  const router = useRouter()
  const t = useTranslation()
  const { lang } = useLanguage()
  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)
  const apiDone = useRef(false)
  const animDone = useRef(false)

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
    return () => timers.forEach(clearTimeout)
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

          {/* Penguin loader */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <PenguinLoader />
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
            className="loading-bar"
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
