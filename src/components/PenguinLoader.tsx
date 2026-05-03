'use client'

import { useState, useEffect, useRef } from 'react'

interface PenguinLoaderProps {
  label?: string
}

export default function PenguinLoader({ label }: PenguinLoaderProps) {
  const [boosted, setBoosted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)
  const boostTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    hintTimer.current = setTimeout(() => {
      if (!hasClicked) setShowHint(true)
    }, 2000)
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current)
      if (boostTimer.current) clearTimeout(boostTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = () => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setHasClicked(true)
    setShowHint(false)
    setBoosted(true)
    if (boostTimer.current) clearTimeout(boostTimer.current)
    boostTimer.current = setTimeout(() => setBoosted(false), 3400)
  }

  const ink   = 'var(--ink, #111111)'
  const bone  = 'var(--bone, #F2EFE7)'
  const clay  = 'var(--clay, #D94A1F)'
  const solar = 'var(--solar, #E8B93C)'
  const ultra = 'var(--ultra, #1B3FD8)'
  const moss  = 'var(--moss, #2F5D3A)'
  const hair  = 'var(--hairline, rgba(26,26,26,0.1))'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Click to boost"
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 16,
        cursor: 'pointer', position: 'relative',
        padding: '8px 12px',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Penguin */}
      <div style={{ position: 'relative' }}>
        <svg
          className={`pixel-penguin${boosted ? ' boost' : ''}`}
          width="64" height="64"
          viewBox="0 0 16 16"
        >
          {/* ── Black body ── */}
          <g fill={ink}>
            {/* Head */}
            <rect x="5" y="1" width="6" height="1" />
            <rect x="4" y="2" width="8" height="1" />
            <rect x="3" y="3" width="10" height="3" />
            {/* Body */}
            <rect x="2" y="6" width="12" height="6" />
            <rect x="3" y="12" width="10" height="1" />
            <rect x="4" y="13" width="7" height="1" />
          </g>

          {/* ── Cream face patch + belly ── */}
          <g fill={bone}>
            {/* Face (cream oval within black head) */}
            <rect x="5" y="3" width="6" height="2" />
            <rect x="6" y="5" width="4" height="1" />
            {/* Belly */}
            <rect x="5" y="6" width="6" height="1" />
            <rect x="4" y="7" width="8" height="4" />
            <rect x="5" y="11" width="6" height="2" />
          </g>

          {/* ── Eyes: black pupils that blink ── */}
          <rect className="penguin-eye" x="5" y="3" width="2" height="2" fill={ink} />
          <rect className="penguin-eye" x="9" y="3" width="2" height="2" fill={ink} />
          {/* White highlight dots */}
          <rect x="6"  y="3" width="1" height="1" fill="white" />
          <rect x="10" y="3" width="1" height="1" fill="white" />

          {/* ── Beak ── */}
          <rect x="7" y="5" width="2" height="2" fill={solar} />

          {/* ── Blush ── */}
          <rect x="5" y="4" width="1" height="1" fill={clay} opacity="0.6" />
          <rect x="10" y="4" width="1" height="1" fill={clay} opacity="0.6" />

          {/* ── Tail (wagging) ── */}
          <g className="penguin-tail">
            <rect x="12" y="9"  width="2" height="1" fill={ink} />
            <rect x="13" y="8"  width="2" height="1" fill={ink} />
            <rect x="13" y="10" width="2" height="1" fill={ink} />
          </g>

          {/* ── Left flipper (static) ── */}
          <g fill={ink}>
            <rect x="2" y="6" width="1" height="5" />
            <rect x="1" y="7" width="1" height="4" />
          </g>

          {/* ── Right flipper (boosts upward) ── */}
          <g className="penguin-flipper" fill={ink}>
            <rect x="13" y="6" width="1" height="5" />
            <rect x="14" y="7" width="1" height="4" />
          </g>

          {/* ── Feet ── */}
          <g fill={solar}>
            <rect x="5"  y="14" width="3" height="1" />
            <rect x="4"  y="15" width="4" height="1" />
            <rect x="9"  y="14" width="3" height="1" />
            <rect x="9"  y="15" width="4" height="1" />
          </g>
        </svg>

        {/* Click hint bubble */}
        {showHint && (
          <div style={{
            position: 'absolute', top: -34, left: '50%',
            transform: 'translateX(-50%)',
            background: ink, color: bone,
            fontSize: 10, fontFamily: 'var(--sans)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '5px 9px', whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Click me
            <span style={{
              position: 'absolute', bottom: -5, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${ink}`,
            }} />
          </div>
        )}
      </div>

      {/* Loading ring */}
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg
          className={`loading-ring${boosted ? ' loading-boost' : ''}`}
          width="88" height="88"
          viewBox="0 0 88 88"
        >
          <circle cx="44" cy="44" r="40" fill="none" stroke={hair} strokeWidth="1" />
          <circle cx="44" cy="4"  r="6" fill={clay}  />
          <circle cx="84" cy="44" r="4" fill={ultra} />
          <circle cx="44" cy="84" r="5" fill={solar} />
          <circle cx="4"  cy="44" r="4" fill={moss}  />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span
            className={`loading-dot${boosted ? ' loading-boost' : ''}`}
            style={{
              display: 'block', width: 10, height: 10,
              background: ink, borderRadius: '50%',
            }}
          />
        </div>
      </div>

      {/* Optional label */}
      {label && (
        <span style={{
          position: 'absolute', bottom: -28, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-3)',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
