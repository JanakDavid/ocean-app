'use client'

import { useLanguage } from '@/lib/LanguageContext'
import type { Lang } from '@/lib/translations'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'cs', label: 'CS' },
]

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        border: '1px solid var(--ink)',
        height: 28,
      }}
    >
      {LANGS.map(({ value, label }, i) => {
        const active = lang === value
        return (
          <button
            key={value}
            onClick={() => setLang(value)}
            aria-pressed={active}
            style={{
              width: 36,
              height: '100%',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--bone)' : 'var(--ink)',
              border: 'none',
              borderLeft: i > 0 ? '1px solid var(--ink)' : 'none',
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.14em',
              padding: 0,
              transition: 'background 120ms ease, color 120ms ease',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
