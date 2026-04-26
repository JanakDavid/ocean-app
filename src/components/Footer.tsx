import { Logomark } from './Navbar'

export default function Footer() {
  return (
    <footer style={{
      marginTop: 128,
      padding: '40px clamp(24px, 4vw, 48px)',
      borderTop: '1px solid var(--hairline)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 12, color: 'var(--ink-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logomark size={14} />
        <span>OCEAN Instrument</span>
      </div>
      <span>© 2026 · Built on open science</span>
    </footer>
  )
}
