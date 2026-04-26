'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

const links = [
  { href: '/',        label: 'Overview',      match: (p: string) => p === '/' },
  { href: '/test',    label: 'Take the test', match: (p: string) => p.startsWith('/test') },
  { href: '/results', label: 'View Result',   match: (p: string) => p.startsWith('/result') },
]

export default function Navbar() {
  const pathname = usePathname()

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
          OCEAN
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {links.map(l => {
          const active = l.match(pathname)
          return (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--sans)', fontSize: 13,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 500 : 400,
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { Logomark }
