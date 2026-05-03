'use client'

import { Logomark } from './Navbar'
import { useTranslation } from '@/lib/useTranslation'

export default function Footer({ className }: { className?: string }) {
  const t = useTranslation()

  return (
    <footer className={className} style={{
      marginTop: 128,
      padding: '40px clamp(24px, 4vw, 48px)',
      borderTop: '1px solid var(--hairline)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 12, color: 'var(--ink-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logomark size={14} />
        <span>{t.footer.brand}</span>
      </div>
      <span>{t.footer.copyright}</span>
    </footer>
  )
}
