'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitch from './LanguageSwitch'
import { useTranslation } from '@/lib/useTranslation'

function Logomark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="6"  cy="6"  r="4" fill="var(--ultra)" />
      <circle cx="18" cy="6"  r="4" fill="var(--moss)"  />
      <circle cx="12" cy="12" r="4" fill="var(--clay)"  />
      <circle cx="6"  cy="18" r="4" fill="var(--solar)" />
      <circle cx="18" cy="18" r="4" fill="var(--plum)"  />
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/',        key: 'overview'   as const, match: (p: string) => p === '/' },
  { href: '/test',    key: 'takeTest'   as const, match: (p: string) => p.startsWith('/test') },
  { href: '/results', key: 'viewResult' as const, match: (p: string) => p.startsWith('/result') },
]

export default function Navbar() {
  const pathname = usePathname()
  const t = useTranslation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bone)',
      padding: '0 clamp(24px, 4vw, 48px)',
      height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--hairline)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <Logomark size={18} />
        <span style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>
          {t.nav.brand}
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {NAV_ITEMS.map(item => {
          const active = item.match(pathname)
          return (
            <Link key={item.href} href={item.href} style={{
              fontFamily: 'var(--sans)', fontSize: 13,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 500 : 400,
              textDecoration: 'none',
            }}>
              {t.nav[item.key]}
            </Link>
          )
        })}
        <LanguageSwitch />
      </div>
    </nav>
  )
}

export { Logomark }
