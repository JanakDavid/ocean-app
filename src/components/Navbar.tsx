'use client'

import { useState } from 'react'
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

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname()
  const t = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={className} style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bone)',
      borderBottom: '1px solid var(--hairline)',
    }}>
      {/* Main bar — 72px tall */}
      <div style={{
        padding: '0 clamp(24px, 4vw, 48px)',
        height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logomark size={18} />
          <span style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>
            {t.nav.brand}
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Desktop nav links */}
          {NAV_ITEMS.map(item => {
            const active = item.match(pathname)
            return (
              <Link key={item.href} href={item.href} className="nav-link" style={{
                fontFamily: 'var(--sans)', fontSize: 15,
                color: active ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: active ? 500 : 400,
                textDecoration: 'none',
              }}>
                {t.nav[item.key]}
              </Link>
            )
          })}

          {/* Language switch — always visible */}
          <LanguageSwitch />

          {/* Hamburger button — mobile only, shown via CSS */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown — max-height drives open/close transition */}
      <div className="nav-dropdown" style={{
        maxHeight: menuOpen ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 280ms ease',
      }}>
        {NAV_ITEMS.map(item => {
          const active = item.match(pathname)
          return (
            <Link key={item.href} href={item.href} onClick={closeMenu} style={{
              display: 'flex', alignItems: 'center',
              minHeight: 48, padding: '0 clamp(24px, 4vw, 48px)',
              fontFamily: 'var(--sans)', fontSize: 15,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 500 : 400,
              textDecoration: 'none',
              borderTop: '1px solid var(--hairline)',
            }}>
              {t.nav[item.key]}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { Logomark }
